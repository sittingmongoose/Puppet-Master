#!/usr/bin/env python3
"""DG-OWN-C whole stored-value/source witnesses. TEST_ONLY, native NOT_RUN.

Original source codecs are imported from the hash-pinned original package.
No new number codec, cap, admission flag, or guard-removal engine is provided.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import weakref

from pm_goal_own_c_oracles import (ROOT, ROLES, ApprovalOwner, PayloadStore,
    SchemaBank, SCHEMA, Suite, Refusal, equal, require)
from pm_goal_own_c_roots import OriginalBank, digest

INPUTS = ROOT / 'Plans/goal_own_c_contracts/source-witness-inputs.json'
_ISSUED_PARTICIPANTS=weakref.WeakKeyDictionary()


def qualify_input(row):
    raw=Path(row['path']).read_bytes()
    require('source/input_hash/'+row['path'],digest(raw)==row['sha256'])
    return raw


def load_originals():
    manifest = json.loads(INPUTS.read_text())
    for row in manifest['files']:
        qualify_input(row)
    path = Path(manifest['original_codec'])
    spec = importlib.util.spec_from_file_location('dg_own_c_original_goal_update_codec', path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    pack_spec = importlib.util.spec_from_file_location('dg_own_c_original_storage_codec', manifest['original_storage_codec'])
    pack_module = importlib.util.module_from_spec(pack_spec)
    sys.modules[pack_spec.name] = pack_module
    pack_spec.loader.exec_module(pack_module)
    module.storage_pack = pack_module.pack
    module.storage_unpack = pack_module.unpack
    original_path=list(sys.path)
    try:
        sys.path.insert(0,str(path.parent))
        native_spec=importlib.util.spec_from_file_location('dg_own_c_original_goal_body_model',manifest['original_goal_model'])
        native=importlib.util.module_from_spec(native_spec)
        sys.modules[native_spec.name]=native
        native_spec.loader.exec_module(native)
    finally:
        sys.path[:]=original_path
    module.native_goal=native
    return manifest, module


def scoped_key(scope):
    # Exact existing SP-305 G/k Project recipe; no normalization or numeric input.
    return ':'.join(scope[k].encode('utf-8').hex() for k in ('storage_instance_id', 'project_id', 'thread_id', 'goal_id'))


class NativeParticipant:
    """Private TEST_ONLY participant, never serialized or accepted by role name."""
    def __init__(self, backend, role):
        self.backend,self.role=backend,role


class PhysicalOwner:
    """Independent TEST_ONLY physical issuance, snapshot and transaction membership.

    Native transaction membership is represented by object identity. Serialized
    transaction strings cannot join a second store to an atomic publication.
    """
    def __init__(self, codec):
        self.codec = codec
        self.cells = {}
        self.issuance = {}
        self.origins = {}
        self.source_bank = SchemaBank(SCHEMA)
        self.root_epoch = 1
        self.owner_epoch = 1
        # This component witness does not instantiate SP-305 WriterDomain.
        self.store_selection = 'TEST_ONLY:compact-result-manifest-store'
        self.participants={role:NativeParticipant(self,role) for role in ROLES}
        _ISSUED_PARTICIPANTS[self]=dict(self.participants)
        self.withdrawn = False
        self.inventory = {role: [] for role in ROLES}
        self.pending = {role: [] for role in ROLES}
        self.effects = []

    def issue(self, owner, key, ref, value, origin):
        raw = self.codec.raw(value)
        require('physical/absent_key', key not in self.cells)
        selection = dict(owner=owner, physical_key=key, schema_ref=ref, sha256=digest(raw))
        self.cells[key] = raw
        self.issuance[key] = (copy.deepcopy(selection), copy.deepcopy(origin))
        self.inventory[owner].append(key)
        return dict(selection=selection, codec_id='pm.goal.canonical_json.v1', bytes_hex=raw.hex(), origin=copy.deepcopy(origin))

    def acquire(self):
        return dict(root_epoch=self.root_epoch, owner_epoch=self.owner_epoch,
                    store_selection=self.store_selection, inventory=copy.deepcopy(self.inventory),
                    pending=copy.deepcopy(self.pending),
                    source_images={key:self.cells[key] for keys in self.inventory.values() for key in keys},
                    source_origins=copy.deepcopy(self.origins))

    def original(self, image, bank, ref):
        # Transport validation is deliberately not the issuance predicate.
        self.source_bank.validate('SourceImage', image)
        selection = image['selection']
        key = selection['physical_key']
        require('image/issued_key', key in self.issuance)
        issued, origin = self.issuance[key]
        require('image/owner', selection['owner'] == issued['owner'])
        require('image/schema_route', selection['schema_ref'] == ref == issued['schema_ref'])
        require('image/codec', image['codec_id'] == 'pm.goal.canonical_json.v1')
        require('image/origin', equal(image['origin'], origin))
        require('image/origin_issued', origin['physical_key'] in self.origins)
        origin_raw = self.origins[origin['physical_key']]
        require('image/origin_hash', digest(origin_raw) == origin['sha256'])
        bank.validate(origin['schema_ref'], self.codec.decode(origin_raw))
        raw = bytes.fromhex(image['bytes_hex'])
        require('image/physical_bytes', raw == self.cells[key])
        require('image/physical_hash', selection['sha256'] == digest(raw))
        value = self.codec.decode(raw)
        bank.validate(ref, value)
        return value

    def commit(self, before, candidates, participants, helper=lambda owner, values: None, fault=None):
        def predicate():
            for field in ('root_epoch','owner_epoch'):
                current=getattr(self,field)
                require('installation/'+field+'/source_type',type(current) is int)
                require('installation/'+field+'/expected_type',type(before[field]) is int)
                if type(current) is int and type(before[field]) is int:
                    require('installation/'+field,before[field] == current)
            require('installation/store_selection', equal(before['store_selection'], self.store_selection))
            require('installation/inventory', equal(before['inventory'], self.inventory))
            require('installation/pending', equal(before['pending'], self.pending))
            actual_images={key:self.cells[key] for keys in self.inventory.values() for key in keys}
            require('installation/source_images',equal(before['source_images'],actual_images))
            require('installation/source_origins',equal(before['source_origins'],self.origins))
            require('installation/withdrawn', self.withdrawn is False)
            require('installation/participants', set(participants) == set(ROLES))
            for role, participant in participants.items():
                require('installation/owner_identity/' + role,participant is _ISSUED_PARTICIPANTS[self][role])
                require('installation/same_transaction/' + role, participant.backend is self)
            for key in candidates:
                require('installation/destination_absent/' + key, key not in self.cells)
        predicate()
        values = copy.deepcopy(candidates)
        expected = copy.deepcopy(candidates)
        helper(self, values)
        predicate()
        require('installation/candidate', equal(values, expected))
        encoded = {key: self.codec.storage_pack(value) for key, value in values.items()}
        for key, raw in encoded.items():
            require('installation/part_size/' + key, len(raw) <= 16384)
        if fault == 'before_commit':
            raise Refusal('installation/before_commit')
        # One assignment publishes the entire complete afterimage in this model.
        self.cells, self.effects = {**self.cells, **encoded}, self.effects + [tuple(encoded)]
        if fault == 'after_commit':
            raise Refusal('installation/ack_lost')
        return copy.deepcopy(values)


class ProposalStorage:
    def __init__(self, bank, codec, request):
        self.bank, self.codec = bank, codec
        self.request = copy.deepcopy(request)
        self.raw = codec.raw(self.request)
        self.payload = PayloadStore(self.raw)
        self.scope = copy.deepcopy(self.request['target']['scope'])
        self.key = 'goal_update_proposal.v1:' + scoped_key(self.scope) + ':' + self.request['command_instance_id'].encode().hex()
        self.original = dict(schema_id='pm.storage_value.goal_update_proposal.v1', schema_version='1.0.0',
            scope=copy.deepcopy(self.scope), physical_key=self.key, proposal_command_instance_id=self.request['command_instance_id'],
            original_request_sha256=digest(self.raw), content=dict(kind='inline', request=copy.deepcopy(self.request)))
        # SP-340 applies to the actual MessagePack wrapper and the actual index.
        if len(codec.storage_pack(self.original)) > 16384:
            self.original['content'] = dict(kind='payload_ref', reference=copy.deepcopy(self.payload.ref))
        self.raw_wrapper = codec.storage_pack(self.original)
        self.pack_issued = True

    def read(self, wrapper, helper=lambda owner: None):
        def predicate(value):
            self.bank.validate('StorageProposal', value)
            require('proposal/scope', equal(value['scope'], self.scope))
            require('proposal/key', value['physical_key'] == self.key)
            require('proposal/identity', value['proposal_command_instance_id'] == self.request['command_instance_id'])
            require('proposal/request_hash', value['original_request_sha256'] == digest(self.raw))
            require('proposal/pack_issued', self.pack_issued is True)
            content = value['content']
            require('proposal/original_storage_route', content['kind'] == self.original['content']['kind'])
            raw = self.payload.resolve(content['reference']) if content['kind'] == 'payload_ref' else self.codec.raw(content['request'])
            require('proposal/resolved_original', raw == self.raw)
            # This exact operation embeds the entire record. Its byte bound
            # dominates the record bound, without inventing a second guard.
            self.last_record_size = len(self.codec.storage_pack(value))
            require('proposal/operation_size', len(self.codec.storage_pack(dict(key=value['physical_key'], value=value))) <= 16384)
            return self.codec.decode(raw)
        predicate(wrapper)
        output = copy.deepcopy(wrapper)
        helper(self)
        return predicate(output)


class ManifestOwner:
    def __init__(self, bank, codec, scope, members, per_part=2):
        self.bank, self.codec = bank, codec
        self.scope, self.members = copy.deepcopy(scope), copy.deepcopy(members)
        self.whole = digest(codec.storage_pack(self.members))
        chunks = [self.members[i:i+per_part] for i in range(0, len(self.members), per_part)] or [[]]
        self.parts = [dict(scope=copy.deepcopy(self.scope), migration_id='migration:original', ordinal=i,
            part_count=len(chunks), whole_manifest_sha256=self.whole, members=copy.deepcopy(chunk)) for i, chunk in enumerate(chunks)]
        prefix='goal_binding_migration_manifest_part.v1:'+scoped_key(self.scope)+':'+b'migration:original'.hex()+':'
        self.keys=[prefix+codec.decimal(i) for i in range(len(self.parts))]
        self.issued = {self.keys[i]: codec.storage_pack(part) for i, part in enumerate(self.parts)}

    def read(self, parts):
        require('manifest/part_count', len(parts) == len(self.parts))
        require('manifest/source_inventory', set(self.issued) == set(self.keys))
        members = []
        for i, part in enumerate(parts):
            self.bank.validate('ManifestPart', part)
            require('manifest/scope/' + str(i), equal(part['scope'], self.scope))
            require('manifest/migration/' + str(i), part['migration_id'] == 'migration:original')
            require('manifest/ordinal/' + str(i), part['ordinal'] == i)
            require('manifest/count/' + str(i), part['part_count'] == len(self.parts))
            require('manifest/whole_commitment/' + str(i), part['whole_manifest_sha256'] == self.whole)
            key=self.keys[i]
            if key in self.issued:
                require('manifest/source_bytes/' + str(i), self.codec.storage_pack(part) == self.issued[key])
            members.extend(part['members'])
        require('manifest/recomputed_whole_commitment', digest(self.codec.storage_pack(members)) == self.whole)
        return members


class ResolutionStorage:
    """Whole content-free wrapper joined to the actual TEST_ONLY approval owner.

    Retained audit does not turn expiry/revocation into a mutation acceptance.
    Mutation acceptance repeats the provider's independent whole predicate.
    """
    def __init__(self, bank, codec, issuer):
        self.bank,self.codec,self.issuer=bank,codec,issuer
        self.scope=copy.deepcopy(issuer.original_request['target']['scope'])
        self.key='goal_update_approval_resolution.v1:'+scoped_key(self.scope)+':'+issuer.resolution['approval_id'].encode().hex()
        self.value=dict(schema_id='pm.storage_value.goal_update_approval_resolution.v1',schema_version='1.0.0',scope=self.scope,physical_key=self.key,resolution=copy.deepcopy(issuer.resolution))

    def read(self,value,current=False,helper=lambda owner:None):
        def predicate(candidate):
            self.bank.validate('StorageApprovalResolution',candidate)
            require('resolution/scope',equal(candidate['scope'],self.scope))
            require('resolution/physical_key',candidate['physical_key']==self.key)
            require('resolution/original_resolution',equal(candidate['resolution'],self.issuer.resolution))
            require('resolution/permission',self.issuer.permission is True)
            # This complete operation embeds its entire record, so its bound
            # also bounds that record under the original MessagePack codec.
            require('resolution/operation_size',len(self.codec.storage_pack(dict(key=self.key,value=candidate)))<=16384)
            if current:
                self.issuer.resolve_for_mutation(copy.deepcopy(self.issuer.original_request),copy.deepcopy(candidate['resolution']))
        predicate(value)
        result=copy.deepcopy(value)
        helper(self.issuer)
        predicate(result)
        return result


class OriginalUpdateGraph:
    """Whole preserved original U0-U4 graph, with independent issuer byte custody.

    A retained old-edition witness, not a current SP-421 reissuance or an agent
    mutation path. This distinction is part of the exported coverage result.
    """
    def __init__(self, inputs, codec, bank):
        directory = Path(inputs['original_update_capture'])
        self.capture = {name: json.loads((directory / (name+'.json')).read_text()) for name in
            ('00-historical-start','01-U0','02-U1','03-U2','04-U3','05-U4','06-physical-raw-values')}
        self.codec, self.bank = codec, bank
        self.raw = {name: codec.raw(value) for name,value in self.capture.items()}
        self.withdrawn = False

    def inspect(self, graph, helper=lambda owner, candidate: None):
        self._check(graph)
        output = copy.deepcopy(graph)
        helper(self, output)
        self._check(output)
        return output

    def _check(self, graph):
        uri = 'https://puppetmaster.local/schemas/goal_update_command_custody/1.0.0/goal_update_command_custody.schema.json#/$defs/'
        body_uri = 'https://puppetmaster.local/schemas/goal_body_custody/1.0.0/goal_body_custody.schema.json#/$defs/'
        roots = [('01-U0','source','SourceAudit'),('01-U0','input','InputContent'),('01-U0','head','ProgressHead'),
            ('01-U0','progress','Progress'),('02-U1','progress','Progress'),('03-U2','progress','Progress'),
            ('04-U3','frozen','Progress'),('04-U3','issued','Progress'),('04-U3','proof','OriginalPublication'),
            ('05-U4','terminal','Terminal')]
        for phase, field, root in roots:
            self.bank.validate(uri+root, graph[phase][field])
        for phase in ('00-historical-start','03-U2'):
            native = graph[phase]['body']
            for field, root in (('body','body'),('control','control')):
                self.bank.validate(body_uri+root, native[field])
            for value in native['revisions']:
                self.bank.validate(body_uri+'revision', value)
        self.bank.validate(body_uri+'pending', graph['02-U1']['pending'])
        self.bank.validate(body_uri+'receipt', graph['03-U2']['receipt'])
        # Each original phase is resolved independently. A caller cannot supply an
        # unrelated receipt and merely repair its digest in every mirror.
        for phase, value in graph.items():
            require('update/original_issuance/' + phase, self.codec.raw(value) == self.raw[phase])
        require('update/withdrawn', self.withdrawn is False)


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    args=parser.parse_args()
    inputs, codec = load_originals()
    bank=SchemaBank(SCHEMA)
    banks=json.loads((ROOT/'Plans/goal_own_c_contracts/whole-root-banks.json').read_text())
    original=OriginalBank(json.loads((ROOT/'Plans/goal_update_schema_resources.json').read_text()), banks['whole_resource_locations'])
    suite=Suite()
    for row in inputs['files']:
        suite.negative('inputs/committed_hash/'+row['path'],row,lambda v:v.__setitem__('sha256','0'*64),qualify_input,'source/input_hash/'+row['path'])
    declaration=json.loads((ROOT/'Plans/goal_update_schema_resources.json').read_text())
    suite.case('banks/whole_original_update',lambda:OriginalBank(declaration,banks['whole_resource_locations']))
    with tempfile.TemporaryDirectory(prefix='dg-own-c-source-') as temporary:
        for entry in declaration['resources']:
            expected=entry['sha256'];key=entry['path']+'@'+expected
            raw=(ROOT/banks['whole_resource_locations'].get(key,entry['path'])).read_bytes()
            path=Path(temporary)/'source.json';path.write_bytes(raw+b' ')
            override={**banks['whole_resource_locations'],key:str(path)}
            suite.case('banks/physical_hash/'+entry['path'],lambda o=override:OriginalBank(declaration,o),'roots/whole_resource_hash/'+entry['path'])
        conflicting=copy.deepcopy(declaration)
        row=copy.deepcopy(conflicting['resources'][1]);row['retrieval_uri']=conflicting['resources'][0]['retrieval_uri'];conflicting['resources'].append(row)
        suite.case('banks/URI_conflict',lambda:OriginalBank(conflicting,banks['whole_resource_locations']),'roots/no_uri_rebinding')
        rows=[]
        for i,const in enumerate((True,1)):
            path=Path(temporary)/('typed-'+str(i)+'.json')
            path.write_text(json.dumps({'$schema':'https://json-schema.org/draft/2020-12/schema','$id':'https://example.test/typed.schema.json','const':const}))
            rows.append(dict(path=str(path),sha256=digest(path.read_bytes()),retrieval_uri='https://example.test/typed.schema.json'))
        suite.case('banks/boolean_integer_schema_alias',lambda:OriginalBank(dict(resources=rows),{}),'roots/no_uri_rebinding')
        path=Path(temporary)/'unvisited.json'
        path.write_text(json.dumps({'$schema':'https://json-schema.org/draft/2020-12/schema','$id':'https://example.test/unused.schema.json','$defs':{'unused':{'$ref':'#/$defs/missing'}}}))
        unused=dict(resources=[dict(path=str(path),sha256=digest(path.read_bytes()),retrieval_uri='https://example.test/unused.schema.json')])
        suite.case('banks/unvisited_reference',lambda:OriginalBank(unused,{}),'roots/unresolved_reference')
    scope=dict(storage_instance_id='11111111-1111-4111-8111-111111111111',project_id='project/1',thread_id='thr_1',goal_id='goal:α')
    known_G='31313131313131312d313131312d343131312d383131312d313131313131313131313131:70726f6a6563742f31:7468725f31:676f616c3aceb1'
    suite.case('keys/SP305_G_known_answer',lambda:require('oracle/SP305_G_known_answer',scoped_key(scope)==known_G))
    request=dict(schema_id='pm.goal.update.proposal_request.v1',schema_version='1.0.0',command_id='cmd.chat.goal.propose_update',command_instance_id='proposal:original',target=dict(scope=scope,expected_revision=1,expected_currentness_hash='a'*64,objective_text='replacement'),actor_ref='agent:original',permission_snapshot_ref='permission:original',source_message_id='agent-message:original',instruction_message_id='user-message:original',return_route_ref='route:original')
    for text,kind in [('replacement','inline'),('🌿'*4000,'payload_ref')]:
        req=copy.deepcopy(request);req['target']['objective_text']=text
        owner=ProposalStorage(bank,codec,req)
        suite.case('proposal/'+kind+'/complete',lambda o=owner:o.read(copy.deepcopy(o.original)))
        require('setup/proposal_route', owner.original['content']['kind']==kind)
        for field,bad,guard in [('physical_key','foreign','proposal/key'),('proposal_command_instance_id','foreign','proposal/identity'),('original_request_sha256','b'*64,'proposal/request_hash')]:
            suite.negative('proposal/'+kind+'/'+field,owner.original,lambda v,f=field,b=bad:v.__setitem__(f,b),owner.read,guard)
        suite.negative('proposal/'+kind+'/omitted_storage_namespace',owner.original,lambda v:v.__setitem__('physical_key',v['physical_key'].replace(known_G.split(':')[0]+':','',1)),owner.read,'proposal/key')
        suite.negative('proposal/'+kind+'/scope',owner.original,lambda v:v['scope'].__setitem__('goal_id','foreign'),owner.read,'proposal/scope')
        alternate=dict(kind='payload_ref',reference=copy.deepcopy(owner.payload.ref)) if kind=='inline' else dict(kind='inline',request=copy.deepcopy(req))
        suite.negative('proposal/'+kind+'/original_storage_route',owner.original,lambda v,a=alternate:v.__setitem__('content',a),owner.read,'proposal/original_storage_route')
        if kind=='inline':
            suite.negative('proposal/inline/full_request',owner.original,lambda v:v['content']['request']['target'].__setitem__('objective_text','foreign'),owner.read,'proposal/resolved_original')
        suite.case('proposal/'+kind+'/last_helper',lambda o=owner:o.read(copy.deepcopy(o.original),lambda x:setattr(x,'pack_issued',False)),'proposal/pack_issued')
    large_request=copy.deepcopy(request);large_request['command_instance_id']='i'*7800
    oversized=ProposalStorage(bank,codec,large_request)
    suite.case('proposal/complete_operation_size',lambda:oversized.read(copy.deepcopy(oversized.original)),'proposal/operation_size')
    aliased_request=copy.deepcopy(request);isolated=ProposalStorage(bank,codec,aliased_request)
    aliased_request['target']['scope']['goal_id']='foreign';aliased_request['target']['objective_text']='foreign'
    suite.case('proposal/caller_alias_cannot_change_original',lambda:isolated.read(copy.deepcopy(isolated.original)))
    approval=ApprovalOwner(request,bank)
    stored=ResolutionStorage(bank,codec,approval)
    suite.case('approval/full_stored_resolution',lambda:stored.read(copy.deepcopy(stored.value)))
    suite.case('approval/current_provider_join',lambda:stored.read(copy.deepcopy(stored.value),current=True))
    for field,bad,guard in [('physical_key','foreign','resolution/physical_key')]:
        suite.negative('resolution/'+field,stored.value,lambda v,f=field,b=bad:v.__setitem__(f,b),stored.read,guard)
    suite.negative('resolution/scope',stored.value,lambda v:v['scope'].__setitem__('goal_id','foreign'),stored.read,'resolution/scope')
    suite.negative('resolution/foreign_decision',stored.value,lambda v:v['resolution'].__setitem__('protected_person_decision_ref','foreign'),stored.read,'resolution/original_resolution')
    approval.permission=False
    suite.case('resolution/audit_permission',lambda:stored.read(copy.deepcopy(stored.value)),'resolution/permission')
    approval.permission=True
    suite.case('resolution/last_helper_epoch',lambda:stored.read(copy.deepcopy(stored.value),current=True,helper=lambda o:setattr(o,'epoch',3)),'U/owner_epoch')
    for state in ('denied','expired','revoked'):
        issuer=ApprovalOwner(request,bank)
        if state=='denied':
            issuer.resolution['decision']='denied';issuer.person_decision['decision']='denied'
            guard='U/approved'
        elif state=='expired':
            issuer.now='2026-11-07T00:00:00Z';guard='U/expiry'
        else:
            issuer.withdrawn=True;guard='U/withdrawn'
        held=ResolutionStorage(bank,codec,issuer)
        suite.case('resolution/'+state+'/retained_audit',lambda o=held:o.read(copy.deepcopy(o.value)))
        suite.case('resolution/'+state+'/current_refused',lambda o=held:o.read(copy.deepcopy(o.value),current=True),guard)
    issuer=ApprovalOwner(request,bank);issuer.resolution['protected_person_decision_ref']='x'*17000;issuer.person_decision=copy.deepcopy(issuer.resolution)
    large_resolution=ResolutionStorage(bank,codec,issuer)
    suite.case('resolution/oversized_complete_operation',lambda:large_resolution.read(copy.deepcopy(large_resolution.value)),'resolution/operation_size')
    native=json.loads((Path(inputs['original_update_capture'])/'06-physical-raw-values.json').read_text())['body']
    body_row=next(r for r in native if r['family']=='goal_body_record')
    receipt_row=[r for r in native if r['family']=='goal_body_mutation_receipt'][-1]
    body=codec.decode(bytes.fromhex(body_row['raw_hex']))
    body_ref='https://puppetmaster.local/schemas/goal_body_custody/1.0.0/goal_body_custody.schema.json#/$defs/storage_body'
    receipt_ref=body_ref.removesuffix('storage_body')+'storage_receipt'
    physical=PhysicalOwner(codec)
    origin=dict(owner='goal',physical_key=receipt_row['key'],schema_ref=receipt_ref,sha256=digest(bytes.fromhex(receipt_row['raw_hex'])))
    physical.origins[origin['physical_key']]=bytes.fromhex(receipt_row['raw_hex'])
    image=physical.issue('goal',body_row['key'],body_ref,body,origin)
    require('setup/exact_original_native_bytes',image['bytes_hex']==body_row['raw_hex'])
    suite.case('image/complete_original_goal_body',lambda:physical.original(image,original,body_ref))
    suite.case('image/immutable_original_key',lambda:physical.issue('goal',body_row['key'],body_ref,body,origin),'physical/absent_key')
    suite.negative('image/missing_original',image,lambda v:v['selection'].__setitem__('physical_key','missing'),lambda v:physical.original(v,original,body_ref),'image/issued_key')
    for field,bad,guard in [('owner','host_stop','image/owner'),('schema_ref','wrong:source','image/schema_route'),('sha256','d'*64,'image/physical_hash')]:
        suite.negative('image/'+field,image,lambda v,f=field,b=bad:v['selection'].__setitem__(f,b),lambda v:physical.original(v,original,body_ref),guard)
    suite.negative('image/codec',image,lambda v:v.__setitem__('codec_id','MessagePack'),lambda v:physical.original(v,original,body_ref),'image/codec')
    suite.negative('image/foreign_origin',image,lambda v:v['origin'].__setitem__('physical_key','foreign'),lambda v:physical.original(v,original,body_ref),'image/origin')
    held_origins=copy.deepcopy(physical.origins);physical.origins={}
    suite.case('image/missing_origin',lambda:physical.original(image,original,body_ref),'image/origin_issued');physical.origins=copy.deepcopy(held_origins)
    physical.origins[origin['physical_key']]=physical.origins[origin['physical_key']]+b' '
    suite.case('image/corrupt_original_origin',lambda:physical.original(image,original,body_ref),'image/origin_hash');physical.origins=held_origins
    changed=copy.deepcopy(image);changed_body=copy.deepcopy(body);changed_body['record']['state']='paused';raw=codec.raw(changed_body);changed['bytes_hex']=raw.hex();changed['selection']['sha256']=digest(raw)
    suite.case('image/foreign_whole_body_coherent_hash',lambda:physical.original(changed,original,body_ref),'image/physical_bytes')
    snapshot=json.loads((Path(inputs['original_update_capture'])/'03-U2.json').read_text())['body']
    def native_snapshot(value):
        try:
            codec.native_goal.validate_snapshot(value)
        except codec.native_goal.Rejected as error:
            raise Refusal('native_goal/'+str(error)) from error
    suite.case('native_goal/complete_original_body_control_history_origins',lambda:native_snapshot(copy.deepcopy(snapshot)))
    def change_currentness(value):
        value['body']['currentness_hash']='b'*64
        value['control']['currentness_hash']='b'*64
        value['control']['body_sha256']=codec.native_goal.bytehash(value['body'])
    suite.negative('native_goal/body_hash_with_coherent_control',snapshot,change_currentness,native_snapshot,'native_goal/body_hash')
    suite.negative('native_goal/physical_body_commitment',snapshot,lambda v:v['control'].__setitem__('body_sha256','b'*64),native_snapshot,'native_goal/body_bytes')
    for field in ('project_id','thread_id','goal_id'):
        suite.negative('native_goal/control_scope/'+field,snapshot,lambda v,f=field:v['control'].__setitem__(f,'foreign'),native_snapshot,'native_goal/scope_'+field)
    suite.negative('native_goal/body_key',snapshot,lambda v:v['control'].__setitem__('body_key','foreign'),native_snapshot,'native_goal/body_key')
    def changed_prior(value):
        value['revisions'][-1]['prior_revision_hash']='b'*64
        value['revisions'][-1]['revision_hash']=codec.native_goal.hashrev(value['revisions'][-1])
        value['control']['latest_revision_hash']=value['revisions'][-1]['revision_hash']
    suite.negative('native_goal/actual_prior_chain',snapshot,changed_prior,native_snapshot,'native_goal/history_chain')
    latest=str(snapshot['revisions'][-1]['revision'])
    suite.negative('native_goal/actual_origin_subject',snapshot,lambda v:v['origins'][latest].__setitem__('goal_id','foreign'),native_snapshot,'native_goal/origin_join')
    def changed_future(value):
        value['revisions'][-1]['created_at']='2026-11-05T00:00:00Z'
        value['revisions'][-1]['revision_hash']=codec.native_goal.hashrev(value['revisions'][-1])
        value['control']['latest_revision_hash']=value['revisions'][-1]['revision_hash']
    suite.negative('native_goal/future_history_with_recomputed_hash',snapshot,changed_future,native_snapshot,'native_goal/future_history')
    def changed_objective(value):
        value['body']['objective_text']='foreign'
        value['body']['currentness_hash']=codec.native_goal.hashbody(value['body'])
        value['control']['currentness_hash']=value['body']['currentness_hash']
        value['control']['body_sha256']=codec.native_goal.bytehash(value['body'])
    suite.negative('native_goal/current_objective_with_recomputed_hashes',snapshot,changed_objective,native_snapshot,'native_goal/current_objective')
    members=[dict(owner=role,physical_key='original:'+role,schema_ref='original:'+role,sha256=digest(role.encode())) for role in ROLES]
    manifest=ManifestOwner(bank,codec,scope,members)
    suite.case('manifest/complete_ordered_parts',lambda:manifest.read(copy.deepcopy(manifest.parts)))
    def stored_manifest(parts):
        owner=ManifestOwner(bank,codec,scope,members)
        # Mutations describe the actual independently acquired physical image;
        # keep its byte copy coherent rather than masking a metadata defect
        # behind a second stale-byte comparison.
        owner.issued={owner.keys[i]:codec.storage_pack(p) for i,p in enumerate(parts)}
        return owner.read(parts)
    for i in range(len(manifest.parts)):
        for field,bad,guard in [('migration_id','foreign','manifest/migration/'),('ordinal',i+1,'manifest/ordinal/'),('part_count',len(manifest.parts)+1,'manifest/count/'),('whole_manifest_sha256','b'*64,'manifest/whole_commitment/')]:
            suite.negative('manifest/'+str(i)+'/'+field,manifest.parts,lambda v,i=i,f=field,b=bad:v[i].__setitem__(f,b),stored_manifest,guard+str(i))
        suite.negative('manifest/'+str(i)+'/scope',manifest.parts,lambda v,i=i:v[i]['scope'].__setitem__('goal_id','foreign'),stored_manifest,'manifest/scope/'+str(i))
        owner=ManifestOwner(bank,codec,scope,members);owner.issued[owner.keys[i]]=owner.issued[owner.keys[i]]+b'\0'
        suite.case('manifest/'+str(i)+'/corrupt_native_bytes',lambda o=owner:o.read(copy.deepcopy(o.parts)),'manifest/source_bytes/'+str(i))
        owner=ManifestOwner(bank,codec,scope,members);owner.issued.pop(owner.keys[i])
        suite.case('manifest/'+str(i)+'/missing_native_source',lambda o=owner:o.read(copy.deepcopy(o.parts)),'manifest/source_inventory')
    owner=ManifestOwner(bank,codec,scope,members);owner.issued[owner.keys[0]+'foreign']=owner.issued[owner.keys[0]]
    suite.case('manifest/extra_native_source',lambda:owner.read(copy.deepcopy(owner.parts)),'manifest/source_inventory')
    owner=ManifestOwner(bank,codec,scope,members);raw=owner.issued.pop(owner.keys[0]);owner.issued[owner.keys[0].replace(known_G.split(':')[0]+':','',1)]=raw
    suite.case('manifest/omitted_storage_namespace',lambda:owner.read(copy.deepcopy(owner.parts)),'manifest/source_inventory')
    suite.negative('manifest/missing_part',manifest.parts,lambda v:v.pop(),manifest.read,'manifest/part_count')
    suite.negative('manifest/duplicate_part',manifest.parts,lambda v:v.append(copy.deepcopy(v[0])),manifest.read,'manifest/part_count')
    suite.negative('manifest/reordered_part',manifest.parts,lambda v:v.reverse(),stored_manifest,'manifest/ordinal/0')
    suite.negative('manifest/member_corruption_against_original_publication',manifest.parts,lambda v:v[0]['members'][0].__setitem__('owner','foreign'),stored_manifest,'manifest/recomputed_whole_commitment')
    # Genuine complete immutable migration result and withdrawal wrappers.
    selection=members[0]
    result=dict(scope=scope,migration_id='migration:original',disposition='enrolled',capture_sha256=digest(codec.raw(members)),original_stop=dict(user_stop_epoch=9,continuation_epoch=7,stop_latched=True),original_association_refs=[],pending_operation_ids=[],prior_receipts=members,published_members=members,writer_domain=selection)
    withdrawal=dict(scope=scope,migration_id='migration:original',withdrawal_id='withdrawal:original',disposition='withdrawn',original_result=selection,fenced_writer_domain=selection,preserved_pending_operation_ids=[])
    suite.case('migration/full_result_root',lambda:bank.validate('MigrationResult',result))
    suite.case('migration/full_withdrawal_root',lambda:bank.validate('MigrationWithdrawalResult',withdrawal))
    candidates={'result':result,**{'manifest:'+str(i):p for i,p in enumerate(manifest.parts)}}
    def fresh():
        owner=PhysicalOwner(codec)
        return owner,owner.acquire(),dict(owner.participants)
    owner,before,participants=fresh()
    suite.case('installation/complete_atomic',lambda:owner.commit(before,candidates,participants))
    require('setup/all_members_visible',set(owner.cells)==set(candidates) and len(owner.effects)==1)
    for field,bad in [('root_epoch',2),('owner_epoch',2),('store_selection','foreign'),('inventory',{r:['missing'] for r in ROLES}),('pending',{r:['unknown'] for r in ROLES})]:
        owner,before,participants=fresh()
        suite.negative('installation/'+field,before,lambda v,f=field,b=bad:v.__setitem__(f,b),lambda v,o=owner,p=participants:o.commit(v,candidates,p),'installation/'+field)
    for field in ('root_epoch','owner_epoch'):
        for name,bad in [('boolean',True),('string','1'),('null',None),('array',[]),('object',{}),('float',1.0)]:
            owner,before,participants=fresh();setattr(owner,field,bad)
            suite.case('installation/'+field+'/source_'+name,lambda o=owner,b=before,p=participants:o.commit(b,candidates,p),'installation/'+field+'/source_type')
            owner,before,participants=fresh()
            suite.negative('installation/'+field+'/expected_'+name,before,lambda v,f=field,b=bad:v.__setitem__(f,b),lambda v,o=owner,p=participants:o.commit(v,candidates,p),'installation/'+field+'/expected_type')
    for role in ROLES:
        owner,before,participants=fresh();participants[role]=NativeParticipant(owner,role)
        suite.case('installation/forged_owner/'+role,lambda o=owner,b=before,p=participants:o.commit(b,candidates,p),'installation/owner_identity/'+role)
        owner,before,participants=fresh();fake=NativeParticipant(owner,role);owner.participants[role]=fake;participants[role]=fake
        suite.case('installation/forged_registry_copy/'+role,lambda o=owner,b=before,p=participants:o.commit(b,candidates,p),'installation/owner_identity/'+role)
        owner,before,participants=fresh();participants[role].backend=PhysicalOwner(codec)
        suite.case('installation/foreign_native_store/'+role,lambda o=owner,b=before,p=participants:o.commit(b,candidates,p),'installation/same_transaction/'+role)
    owner,before,participants=fresh()
    suite.case('installation/final_candidate',lambda:owner.commit(before,candidates,participants,lambda o,v:v['result']['original_stop'].__setitem__('stop_latched',False)),'installation/candidate')
    owner,before,participants=fresh();participants.pop('sir')
    suite.case('installation/missing_participant',lambda:owner.commit(before,candidates,participants),'installation/participants')
    owner,before,participants=fresh();owner.withdrawn=True
    suite.case('installation/withdrawn',lambda:owner.commit(before,candidates,participants),'installation/withdrawn')
    for field in ('source_images','source_origins'):
        owner,before,participants=fresh()
        suite.negative('installation/'+field,before,lambda v,f=field:v.__setitem__(f,{'foreign':b'foreign'}),lambda v,o=owner,p=participants:o.commit(v,candidates,p),'installation/'+field)
    owner=PhysicalOwner(codec)
    owner.origins[origin['physical_key']]=bytes.fromhex(receipt_row['raw_hex'])
    owner.issue('goal',body_row['key'],body_ref,body,origin)
    before=owner.acquire();participants=dict(owner.participants)
    suite.case('installation/whole_source_image_CAS',lambda:owner.commit(before,candidates,participants,lambda o,v:o.cells.__setitem__(body_row['key'],o.cells[body_row['key']]+b' ')),'installation/source_images')
    for key in candidates:
        owner,before,participants=fresh();owner.cells[key]=b'occupied'
        suite.case('installation/occupied/'+key,lambda o=owner,b=before,p=participants:o.commit(b,candidates,p),'installation/destination_absent/'+key)
        owner,before,participants=fresh();oversize_candidates=copy.deepcopy(candidates)
        target=oversize_candidates[key]['prior_receipts'] if key=='result' else oversize_candidates[key]['members']
        target[0]['owner']='x'*17000
        bank.validate('MigrationResult' if key=='result' else 'ManifestPart',oversize_candidates[key])
        suite.case('installation/oversized/'+key,lambda o=owner,b=before,p=participants,c=oversize_candidates:o.commit(b,c,p),'installation/part_size/'+key)
    for fault in ('before_commit','after_commit'):
        owner,before,participants=fresh()
        suite.case('installation/'+fault,lambda o=owner,b=before,p=participants,f=fault:o.commit(b,candidates,p,fault=f),'installation/before_commit' if fault=='before_commit' else 'installation/ack_lost')
        suite.case('installation/'+fault+'/visibility',lambda o=owner,f=fault:require('installation/durable_prefix',set(o.cells)==(set(candidates) if f=='after_commit' else set())))
    graph=OriginalUpdateGraph(inputs,codec,original)
    suite.case('W1/full_retained_direct_Save_U0_U4',lambda:graph.inspect(copy.deepcopy(graph.capture)))
    for phase in graph.capture:
        # Add a schema-invisible observation only to this external phase carrier.
        # The underlying complete roots remain valid; actual original issuance
        # must still reject the changed carrier, independently of its hashes.
        suite.negative('W1/original_phase/'+phase,graph.capture,lambda v,p=phase:v[p].__setitem__('foreign_observation',True),graph.inspect,'update/original_issuance/'+phase)
    suite.case('W1/last_helper_withdrawal',lambda:graph.inspect(copy.deepcopy(graph.capture),lambda o,v:setattr(o,'withdrawn',True)),'update/withdrawn')
    guards={}
    for row in suite.rows:
        if row['expected_guard'] is not None:
            guards.setdefault(row['expected_guard'],[]).append(row['id'])
    out=dict(status='pass' if not suite.failures else 'fail',qualification='TEST_ONLY_PARTIAL_SOURCE_CLOSURE_NATIVE_NOT_RUN',
        cases=len(suite.rows),positives=sum(r['valid'] for r in suite.rows),negatives=sum(not r['valid'] for r in suite.rows),
        new_guards_with_negatives={k:v for k,v in guards.items() if not k.startswith(('U/','native_goal/'))},
        inherited_provider_guards_with_negatives={k:v for k,v in guards.items() if k.startswith('U/')},
        inherited_native_goal_guards_with_negatives={k:v for k,v in guards.items() if k.startswith('native_goal/')},
        results=suite.rows,failures=suite.failures,
        coverage=dict(W1='complete retained original direct Save U0-U4 graph; current, agent and fault graphs remain open',
            O4='whole inline/reference proposal, stored resolution and provider join; retained denied/expired/revoked audit versus current refusal',
            O5='one whole retained original Goal outer image and its original receipt; ordered MessagePack manifest and compact result/manifest transaction witnesses; six-owner native binding corpus remains open'),
        source_input_manifest_sha256=digest(INPUTS.read_bytes()),
        source_oracle_sha256=digest(Path(__file__).read_bytes()),
        whole_resource_qualifier_sha256=digest((ROOT/'scripts/pm_goal_own_c_roots.py').read_bytes()),
        first_part_adapter_sha256=digest((ROOT/'scripts/pm_goal_own_c_oracles.py').read_bytes()))
    Path(args.output).write_text(json.dumps(out,indent=2)+'\n')
    print(json.dumps({k:out[k] for k in ('status','cases','positives','negatives','failures')},indent=2))
    return 0 if not suite.failures else 1


if __name__=='__main__':
    try:
        raise SystemExit(main())
    except Refusal as error:
        print('setup refused: '+str(error),file=sys.stderr)
        raise SystemExit(2)
