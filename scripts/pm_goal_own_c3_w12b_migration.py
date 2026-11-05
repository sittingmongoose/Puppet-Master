"""W12b M1-M9 TEST_ONLY original participants and atomic destination witness.

This file models the actual owner boundary, independently held source bytes,
the native dispatch roster, and complete destination wrappers. No native app
installation, transport-issued authority, retained-source rewrite or new codec.
"""
from __future__ import annotations

import copy
import json
from pathlib import Path
import weakref

from pm_goal_own_c_oracles import ROOT, ROLES, SchemaBank, SCHEMA, require, equal, Refusal
from pm_goal_own_c_roots import digest
from pm_goal_own_c_source_oracles import scoped_key
from pm_goal_own_c3_w12b_roots import CANCEL, BINDING

WRITERS = ('goal_birth', 'plan_goal_birth_or_attach', 'workflow_attach',
           'binding_owner_transfer', 'binding_migration', 'binding_restore', 'binding_content_delete')
_OWNERS = weakref.WeakKeyDictionary()


class OriginalOwner:
    """An independently instantiated fixture owner with an exhaustive database.

    A role string, a source-image value, or a copied participant never enrolls.
    The real boundary chooses participants, and this private registry checks it.
    """
    def __init__(self, boundary, role):
        self.boundary, self.role = boundary, role
        self.epoch = 1
        self.available = True
        self.rows = {}
        self.origins = {}
        self.pending = {}
        self.receipts = {}

    def issue(self, key, realm, ref, value, *, original_json=False):
        self.boundary.roots.check(realm, ref, value)
        require('M12/immutable_original_key', key not in self.rows)
        codec = self.boundary.codec
        raw = codec.raw(value) if original_json else codec.storage_pack(value)
        selection = dict(owner=self.role, physical_key=key, schema_ref=ref, sha256=digest(raw))
        origin = dict(owner=self.role, physical_key='TEST_ONLY:original-issuance:' + key,
                      schema_ref=BINDING + '#/$defs/OriginalTransaction', sha256='')
        transaction = self.boundary.transaction(self.role, 'original:' + key)
        origin_raw = codec.storage_pack(transaction)
        origin['sha256'] = digest(origin_raw)
        self.origins[origin['physical_key']] = origin_raw
        image = dict(selection=selection, codec_id='pm.goal.canonical_json.v1' if original_json else 'pm.storage.canonical_msgpack.v1',
                     bytes_hex=raw.hex(), origin=origin)
        self.rows[key] = dict(image=copy.deepcopy(image), raw=raw, realm=realm, value=copy.deepcopy(value))
        return copy.deepcopy(image)

    def enumerate(self):
        require('M12/database/' + self.role, self.available is True)
        return dict(role=self.role, sources=[copy.deepcopy(v['image']) for _, v in sorted(self.rows.items())],
                    pending_operations=sorted(self.pending), prior_receipts=copy.deepcopy(list(self.receipts.values())))

    def authenticate(self, mapping):
        require('M12/inventory/' + self.role, equal(mapping, self.enumerate()))
        for image in mapping['sources']:
            key = image['selection']['physical_key']
            row = self.rows[key]
            raw = bytes.fromhex(image['bytes_hex'])
            require('M12/source_bytes/' + self.role, raw == row['raw'])
            require('M12/source_hash/' + self.role, digest(raw) == image['selection']['sha256'])
            origin = image['origin']
            require('M12/origin/' + self.role, digest(self.origins[origin['physical_key']]) == origin['sha256'])
            self.boundary.roots.check('producer', origin['schema_ref'], self.boundary.codec.storage_unpack(self.origins[origin['physical_key']]))
            value = self.boundary.codec.decode(raw) if image['codec_id'] == 'pm.goal.canonical_json.v1' else self.boundary.codec.storage_unpack(raw)
            self.boundary.roots.check(row['realm'], image['selection']['schema_ref'], value)
        return copy.deepcopy(mapping)


class MigrationBoundary:
    def __init__(self, roots, codec, inputs):
        self.roots, self.codec, self.bank = roots, codec, SchemaBank(SCHEMA)
        snapshot = json.loads((Path(inputs['original_update_capture']) / '03-U2.json').read_text())['body']
        codec.native_goal.validate_snapshot(snapshot)
        self.original_snapshot = copy.deepcopy(snapshot)
        self.scope = {k: snapshot['control'][k] for k in ('storage_instance_id', 'project_id', 'thread_id', 'goal_id')}
        self.root = 'TEST_ONLY:held-original-native-root'
        self.root_epoch = 1
        self.restore_epoch = 1
        self.hold_epoch = 1
        self.permission = True
        self.audit_permission = True
        self.content_available = True
        self.withdrawn = False
        self.host_owner = 'TEST_ONLY:original-effective-host-stop'
        self.owners = {r: OriginalOwner(self, r) for r in ROLES}
        _OWNERS[self] = dict(self.owners)
        self.writers = []
        method_hash = digest((ROOT / 'Plans/goal_cancel_contracts/execution-methods.json').read_bytes())
        bank_hash = roots.selection_rows['producer']['sha256']
        for operation in WRITERS:
            self.writers.append(dict(operation=operation, original_owner_ref='TEST_ONLY:native:' + operation,
                original_owner_epoch=1, method_id='TEST_ONLY:native-dispatch:' + operation,
                method_contract_sha256=method_hash, schema_resources_sha256=bank_hash,
                original_registration_ref='TEST_ONLY:registration:' + operation, disposition='participating'))
        self.native_dispatch = [roots.make('producer', BINDING + '#/$defs/NativeWriterDescriptor', dict(
            operation=w['operation'], native_handler_id=w['method_id'], original_owner_ref=w['original_owner_ref'],
            original_owner_epoch=w['original_owner_epoch'], storage_instance_id=self.scope['storage_instance_id'],
            storage_family_ids=['goal_execution_binding_control'], route_schema_ids=[BINDING], native_binding_generation=1,
            original_registration_ref=w['original_registration_ref'], disposition=w['disposition'])) for w in self.writers]
        self.cells = {}
        self.installation_originals = {}
        self.results = {}
        self.result_origins = {}
        self.withdrawals = {}
        self.transactions = []
        self.migration_id = 'migration:W12b'
        self.stop_key = 'TEST_ONLY:original-host-stop'
        self.stop = roots.make('producer', CANCEL + '#/$defs/StopControl', {
            **self.scope, 'user_stop_epoch': 7, 'continuation_epoch': 11, 'latched': True,
            'last_original_stop_receipt_ref': 'TEST_ONLY:prior-stop:7',
            'last_original_stop_receipt_sha256': digest(codec.storage_pack({'prior_stop': 7})),
            'original_birth_or_adoption_ref': 'TEST_ONLY:original-host-domain-birth'})
        self.owners['host_stop'].issue(self.stop_key, 'producer', CANCEL + '#/$defs/StopControl', self.stop)
        self.goal_images = self._issue_original_goal(inputs)
        self.current_body_control = copy.deepcopy(snapshot['control'])
        self.current_body_control.update(schema_id='pm.goal.body_control.v2', cancellation_pending=None)

    def _issue_original_goal(self, inputs):
        native = json.loads((Path(inputs['original_update_capture']) / '06-physical-raw-values.json').read_text())['body']
        uri = 'https://puppetmaster.local/schemas/goal_body_custody/1.0.0/goal_body_custody.schema.json#/$defs/'
        names = {'goal_body_record': 'storage_body', 'goal_objective_revision': 'storage_revision',
                 'goal_objective_origin': 'storage_origin', 'goal_body_control': 'storage_control',
                 'goal_body_mutation_receipt': 'storage_receipt'}
        images = []
        for row in native:
            if row['family'] not in names:
                continue
            raw = bytes.fromhex(row['raw_hex'])
            value = self.codec.decode(raw)
            # Preserve the exact original physical bytes and schema/recipe.
            image = self.owners['goal'].issue(row['key'], 'producer', uri + names[row['family']], value, original_json=True)
            require('M12/retained_physical_bytes', image['bytes_hex'] == raw.hex())
            images.append(image)
        require('M12/whole_goal_inventory', bool(images))
        return images

    def transaction(self, role, operation):
        return self.roots.make('producer', BINDING + '#/$defs/OriginalTransaction', {
            'owner_method': 'owner.storage.goal_binding_migration.commit.v1',
            'original_owner_ref': 'TEST_ONLY:' + role, 'original_owner_epoch': 1,
            'original_operation_id': operation, 'original_transaction_id': 'TEST_ONLY:tx:' + operation,
            'original_causation_ref': 'TEST_ONLY:original-cause:' + operation,
            'original_permission_source': {'family_id': 'TEST_ONLY:permissions', 'physical_key': 'TEST_ONLY:permission',
                 'schema_id': 'TEST_ONLY:permission', 'schema_version': '1.0.0',
                 'codec_id': 'pm.storage.canonical_msgpack.v1', 'complete_value_sha256': 'a' * 64}})

    def selector(self):
        return dict(scope=copy.deepcopy(self.scope), migration_id=self.migration_id)

    def capture(self, selector, helper=lambda boundary: None):
        self.bank.validate('MigrationSelector', selector)
        expected = copy.deepcopy(selector)
        before = self.fence()
        self.guard(before)
        require('M12/selector', equal(selector, self.selector()))
        request = dict(**copy.deepcopy(selector), expected_writer_domain=self.pre_domain(),
                       owner_mappings=[self.owners[r].enumerate() for r in ROLES])
        self.bank.validate('MigrationRequest', request)
        helper(self)
        self.guard(before)
        require('M12/selector_after_helper', equal(selector, expected))
        for mapping in request['owner_mappings']:
            self.owners[mapping['role']].authenticate(mapping)
        return request, before

    def pre_domain(self):
        value = self.dispatch_input()
        return dict(owner='storage', physical_key='TEST_ONLY:actual-pre-migration-domain',
                    schema_ref=BINDING + '#/$defs/DispatchCommitmentInput', sha256=digest(self.codec.storage_pack(value)))

    def dispatch_input(self):
        value = dict(domain='pm.goal.execution_dispatch.v1', storage_instance_id=self.scope['storage_instance_id'],
                     native_root_identity=self.root, complete_descriptors=copy.deepcopy(self.native_dispatch))
        self.roots.check('producer', BINDING + '#/$defs/DispatchCommitmentInput', value)
        return value

    def fence(self):
        return dict(root=self.root, root_epoch=self.root_epoch, restore_epoch=self.restore_epoch,
                    hold_epoch=self.hold_epoch, effective_stop=copy.deepcopy(self.stop), owners={r: {'instance': id(self.owners[r]), 'epoch': self.owners[r].epoch,
                    'rows': copy.deepcopy(self.owners[r].rows), 'origins': copy.deepcopy(self.owners[r].origins),
                    'pending': copy.deepcopy(self.owners[r].pending), 'receipts': copy.deepcopy(self.owners[r].receipts)} for r in ROLES},
                    native_dispatch=copy.deepcopy(self.native_dispatch), writers=copy.deepcopy(self.writers))

    def guard(self, before):
        require('M12/permission', self.permission is True)
        require('M12/content', self.content_available is True)
        require('M12/withdrawn', self.withdrawn is False)
        for field in ('root_epoch', 'restore_epoch', 'hold_epoch'):
            require('M12/type/' + field, type(getattr(self, field)) is int and type(before[field]) is int)
            require('M12/fence/' + field, getattr(self, field) == before[field])
        require('M12/fence/root', before['root'] == self.root)
        require('M12/effective_stop', equal(before['effective_stop'], self.stop))
        require('M12/owner_members', set(self.owners) == set(ROLES))
        for role in ROLES:
            require('M12/owner_identity/' + role, self.owners[role] is _OWNERS[self][role])
            require('M12/owner_backend/' + role, self.owners[role].boundary is self)
            require('M12/database/' + role, self.owners[role].available is True)
            actual = self.fence()['owners'][role]
            for field in ('epoch', 'rows', 'origins', 'pending', 'receipts'):
                require('M12/fence/' + role + '/' + field, equal(actual[field], before['owners'][role][field]))
        require('M12/dispatch', equal(self.native_dispatch, before['native_dispatch']))
        require('M12/registered_writers', equal(self.writers, before['writers']))
        matching = len(self.native_dispatch) == len(self.writers) and all(
            equal({k: d[k] for k in ('operation', 'original_owner_ref', 'original_owner_epoch', 'original_registration_ref', 'disposition')},
                  {k: w[k] for k in ('operation', 'original_owner_ref', 'original_owner_epoch', 'original_registration_ref', 'disposition')})
            and d['native_handler_id'] == w['method_id'] for d, w in zip(self.native_dispatch, self.writers))
        require('M12/all_native_writers', matching)
        require('M12/seven_categories', [w['operation'] for w in self.writers] == list(WRITERS))

    def selection(self, key, value, ref):
        return dict(owner='storage', physical_key=key, schema_ref=ref, sha256=digest(self.codec.storage_pack(value)))

    def physical_selection(self, key, value, family):
        return dict(family_id=family, physical_key=key, schema_id=value['schema_id'], schema_version=value['schema_version'],
                    codec_id='pm.storage.canonical_msgpack.v1', complete_value_sha256=digest(self.codec.storage_pack(value)))

    def wrap(self, name, record, key):
        ref = (CANCEL if name in ('StorageStopControl', 'StorageBodyControlV2') else BINDING) + '#/$defs/' + name
        return self.roots.make('producer', ref, dict(storage_instance_id=self.scope['storage_instance_id'], physical_key=key, record=record)), ref

    def candidate(self, request):
        """Complete no-association destination; no shape-only enrolled marker."""
        current = {m['role']: m for m in request['owner_mappings']}
        require('M12/six_mappings', set(current) == set(ROLES) and len(request['owner_mappings']) == len(ROLES))
        for role in ROLES:
            self.owners[role].authenticate(current[role])
        # This edition intentionally supports only authenticated no-association.
        # Bound Plan/Workflow originals need their whole native mapping factories.
        require('M12/no_association_originals', not current['plan']['sources'] and not current['workflow']['sources'])
        snapshot = copy.deepcopy(self.original_snapshot)
        self.codec.native_goal.validate_snapshot(snapshot)
        actual = {'revisions': [], 'origins': {}}
        for row in self.owners['goal'].rows.values():
            record = self.codec.decode(row['raw'])['record']
            ref = row['image']['selection']['schema_ref']
            if ref.endswith('/storage_body'):
                actual['body'] = record
            elif ref.endswith('/storage_control'):
                actual['control'] = record
            elif ref.endswith('/storage_revision'):
                actual['revisions'].append(record)
            elif ref.endswith('/storage_origin'):
                actual['origins'][str(record['goal_revision'])] = record
        actual['revisions'].sort(key=lambda r: r['revision'])
        self.codec.native_goal.validate_snapshot(actual)
        require('M12/native_goal_image_join', equal(snapshot, actual))
        require('M12/active_run', snapshot['body']['active_run_ref'] is None)
        bcontrol = copy.deepcopy(snapshot['control'])
        bcontrol.update(schema_id='pm.goal.body_control.v2', cancellation_pending=None)
        values, refs = {}, {}
        g = scoped_key(self.scope)
        def add(name, record, key):
            value, ref = self.wrap(name, record, key)
            values[key], refs[key] = value, ref
            family = {'StorageWriterDomain': 'goal_execution_writer_domain', 'StorageWriterDomainHead': 'goal_execution_writer_domain_head',
                'StorageBindingRevision': 'goal_execution_binding_revision', 'StorageBindingOrigin': 'goal_execution_binding_origin',
                'StorageBindingControl': 'goal_execution_binding_control', 'StorageStopControl': 'goal_host_stop_control',
                'StorageBodyControlV2': 'goal_body_control'}[name]
            return self.physical_selection(key, value, family)
        domain = self.roots.make('producer', BINDING + '#/$defs/WriterDomain', {
            'storage_instance_id': self.scope['storage_instance_id'], 'domain_generation': 1,
            'native_root_identity': self.root, 'schema_resources_sha256': self.roots.selection_rows['producer']['sha256'],
            'complete_original_dispatch_registration_sha256': self.codec.h(self.dispatch_input()),
            'writers': self.writers, 'original_installation': self.transaction('storage', self.migration_id)})
        storage_key = self.scope['storage_instance_id'].encode().hex()
        domain_selection = add('StorageWriterDomain', domain, 'goal_execution_writer_domain.v1:' + storage_key + ':epoch:1')
        add('StorageWriterDomainHead', dict(storage_instance_id=self.scope['storage_instance_id'], domain_generation=1,
            domain=domain_selection, original_installation_transaction_id=domain['original_installation']['original_transaction_id']),
            'goal_execution_writer_domain_head.v1:' + storage_key)
        revision = self.roots.make('producer', BINDING + '#/$defs/BindingRevision', dict(scope=self.scope, binding_revision=1,
            previous_revision=None, active_run_ref=None, associations=[], host_execution_owner_ref=self.host_owner,
            host_execution_owner_epoch=self.owners['host_stop'].epoch, writer_domain=domain_selection,
            original_goal_birth_or_binding_operation=self.migration_id))
        revision_selection = add('StorageBindingRevision', revision, 'goal_execution_binding_revision.v1:' + g + ':revision:1')
        original_members = []
        for mapping in request['owner_mappings']:
            for image in mapping['sources']:
                sel = image['selection']
                original_members.append(dict(family_id='TEST_ONLY:original:' + mapping['role'], physical_key=sel['physical_key'],
                    schema_id=sel['schema_ref'], schema_version='original', codec_id=image['codec_id'], complete_value_sha256=sel['sha256']))
        body_image = next(i for i in self.goal_images if i['selection']['schema_ref'].endswith('/storage_body'))
        control_image = next(i for i in self.goal_images if i['selection']['schema_ref'].endswith('/storage_control'))
        stop_image = self.owners['host_stop'].rows[self.stop_key]['image']
        origin = self.roots.make('producer', BINDING + '#/$defs/BindingOrigin', dict(scope=self.scope, binding_revision=1,
            issued_revision_key=revision_selection['physical_key'], issued_revision_sha256=revision_selection['complete_value_sha256'],
            before_control_sha256=None, original_goal_body_sha256=body_image['selection']['sha256'],
            original_goal_control_sha256=control_image['selection']['sha256'], original_stop_control_sha256=stop_image['selection']['sha256'],
            original_source_members=original_members, issuer=self.transaction('storage', self.migration_id)))
        origin_selection = add('StorageBindingOrigin', origin, 'goal_execution_binding_origin.v1:' + g + ':revision:1')
        binding_control = self.roots.make('producer', BINDING + '#/$defs/BindingControl', dict(scope=self.scope, control_epoch=1,
            binding_revision=1, current_revision=revision_selection, current_origin=origin_selection, writer_domain=domain_selection, pending=None))
        add('StorageBindingControl', binding_control, 'goal_execution_binding_control.v1:' + g)
        add('StorageStopControl', self.stop, 'goal_host_stop_control:' + g)
        add('StorageBodyControlV2', bcontrol, control_image['selection']['physical_key'])
        members = [self.selection(k, v, refs[k]) for k, v in values.items()]
        pending = sorted({op for m in request['owner_mappings'] for op in m['pending_operations']})
        blocked = bool(pending)
        result = dict(scope=copy.deepcopy(self.scope), migration_id=self.migration_id,
            disposition='blocked_unresolved' if blocked else 'enrolled', capture_sha256=digest(self.codec.storage_pack(request)),
            original_stop=dict(user_stop_epoch=self.stop['user_stop_epoch'], continuation_epoch=self.stop['continuation_epoch'], stop_latched=self.stop['latched']),
            original_association_refs=[], pending_operation_ids=pending,
            prior_receipts=[s for m in request['owner_mappings'] for s in m['prior_receipts']],
            published_members=[] if blocked else members, writer_domain=self.selection(domain_selection['physical_key'], values[domain_selection['physical_key']], refs[domain_selection['physical_key']]))
        self.bank.validate('MigrationResult', result)
        if blocked:
            values, refs = {}, {}
        manifest = [i['selection'] for m in request['owner_mappings'] for i in m['sources']] + result['published_members']
        parts = []
        for offset in range(0, len(manifest), 8):
            part = dict(scope=copy.deepcopy(self.scope), migration_id=self.migration_id, ordinal=len(parts),
                part_count=(len(manifest) + 7) // 8, whole_manifest_sha256=digest(self.codec.storage_pack(manifest)), members=manifest[offset:offset+8])
            self.bank.validate('ManifestPart', part)
            key = 'goal_binding_migration_manifest_part.v1:' + g + ':' + self.migration_id.encode().hex() + ':' + str(len(parts))
            values[key] = part
            parts.append(key)
        key = 'goal_binding_migration_result.v1:' + g + ':' + self.migration_id.encode().hex()
        values[key] = result
        return values, result, parts

    def commit(self, request, before, helper=lambda boundary, values: None, fault=None):
        self.bank.validate('MigrationRequest', request)
        if self.migration_id in self.results:
            prior = self.results[self.migration_id]
            require('M12/retry_capture', digest(self.codec.storage_pack(request)) == prior['capture_sha256'])
            return self.read_result(self.selector())
        self.guard(before)
        expected_request, _ = self.capture(self.selector())
        require('M12/independent_capture', equal(request, expected_request))
        values, result, parts = self.candidate(request)
        expected = copy.deepcopy(values)
        helper(self, values)
        self.guard(before)
        require('M12/whole_candidate', equal(values, expected))
        for key, value in values.items():
            require('M12/destination_absent', key not in self.cells)
            require('M12/stored_part_size', len(self.codec.storage_pack(value)) <= 16384)
            require('M12/operation_size', len(self.codec.storage_pack({'physical_key': key, 'value': value})) <= 16384)
        if fault == 'before':
            raise Refusal('M12/before_commit')
        # A single backend state publication includes *all* complete values,
        # receipt, manifest, and the unchanged-value existing Stop authority.
        encoded = {k: self.codec.storage_pack(v) for k, v in values.items()}
        self.cells, self.installation_originals, self.results, self.result_origins, self.transactions = ({**self.cells, **encoded},
            {**self.installation_originals, **encoded}, {**self.results, self.migration_id: copy.deepcopy(result)},
            {**self.result_origins, self.migration_id: self.root}, self.transactions + [tuple(values)])
        if fault == 'after':
            raise Refusal('M12/lost_ack')
        return self.read_result(self.selector())

    def read_result(self, selector, helper=lambda boundary: None):
        self.bank.validate('MigrationSelector', selector)
        require('M12/read_selector', equal(selector, self.selector()))
        require('M12/audit_permission', self.audit_permission is True)
        require('M12/result_issued', self.migration_id in self.results)
        expected = copy.deepcopy(self.results[self.migration_id])
        root = [self.root, self.root_epoch, self.restore_epoch, self.hold_epoch]
        def predicate():
            require('M12/audit_permission', self.audit_permission is True)
            require('M12/audit_original_root', self.result_origins.get(self.migration_id) == self.root)
            require('M12/audit_fence', equal(root, [self.root, self.root_epoch, self.restore_epoch, self.hold_epoch]))
            g = scoped_key(self.scope)
            result_key = 'goal_binding_migration_result.v1:' + g + ':' + self.migration_id.encode().hex()
            require('M12/result_bytes', self.cells.get(result_key) == self.codec.storage_pack(expected))
            require('M12/result_original_issuance', self.installation_originals.get(result_key) == self.cells.get(result_key))
            self.bank.validate('MigrationResult', expected)
            for selection in expected['published_members']:
                # The immutable issuance afterimage authenticates an old result.
                # Mutable Stop/control may lawfully advance after enrollment.
                raw = self.installation_originals.get(selection['physical_key'])
                require('M12/destination_present', raw is not None)
                require('M12/destination_hash', digest(raw) == selection['sha256'])
                self.roots.check('producer', selection['schema_ref'], self.codec.storage_unpack(raw))
            prefix = 'goal_binding_migration_manifest_part.v1:' + g + ':' + self.migration_id.encode().hex() + ':'
            parts = [self.codec.storage_unpack(raw) for key, raw in self.cells.items() if key.startswith(prefix)]
            require('M12/manifest_present', bool(parts))
            require('M12/manifest_original_bytes', all(raw == self.installation_originals.get(key) for key, raw in self.cells.items() if key.startswith(prefix)))
            parts.sort(key=lambda p: p['ordinal'])
            require('M12/manifest_ordinals', [p['ordinal'] for p in parts] == list(range(parts[0]['part_count'])))
            members = [m for p in parts for m in p['members']]
            for part in parts:
                self.bank.validate('ManifestPart', part)
                require('M12/manifest_identity', equal(part['scope'], self.scope) and part['migration_id'] == self.migration_id)
                require('M12/manifest_count', part['part_count'] == len(parts))
                require('M12/manifest_hash', part['whole_manifest_sha256'] == digest(self.codec.storage_pack(members)))
        predicate()
        helper(self)
        predicate()
        return expected

    def publish_same_host_domain(self, stop, control):
        """Publish through the existing host's same modeled native transaction.

        No Goal-local second clock is installed. Historical afterimages remain
        immutable, while current wrappers and the original host authority move
        together. Callers have already held/rechecked the complete boundary.
        """
        updates = {}
        expected_keys = {s['physical_key'] for s in self.results[self.migration_id]['published_members']
                         if s['schema_ref'].endswith(('/StorageStopControl', '/StorageBodyControlV2'))}
        for key, raw in self.cells.items():
            value = self.codec.storage_unpack(raw)
            schema = value.get('schema_id')
            record = value.get('record', {})
            if schema not in ('pm.storage_value.goal_host_stop_control.v1', 'pm.storage_value.goal_body_control.v2'):
                continue
            if not all(equal(record.get(k), v) for k, v in self.scope.items()):
                continue
            if schema == 'pm.storage_value.goal_host_stop_control.v1':
                require('M12/live_stop_preimage', equal(record, self.stop))
                value['record'] = copy.deepcopy(stop)
                updates[key] = self.codec.storage_pack(value)
            elif schema == 'pm.storage_value.goal_body_control.v2':
                require('M12/live_body_control_preimage', equal(record, self.current_body_control))
                value['record'] = copy.deepcopy(control)
                updates[key] = self.codec.storage_pack(value)
        require('M12/live_stop_control_routes', len(expected_keys) == 2 and set(updates) == expected_keys)
        self.stop, self.current_body_control, self.cells = copy.deepcopy(stop), copy.deepcopy(control), {**self.cells, **updates}

    def advance_original_stop(self):
        value = copy.deepcopy(self.stop)
        value.update(user_stop_epoch=value['user_stop_epoch'] + 1, continuation_epoch=value['continuation_epoch'] + 1, latched=True)
        self.stop_key = 'TEST_ONLY:original-host-stop:' + str(value['user_stop_epoch'])
        value['last_original_stop_receipt_ref'] = 'TEST_ONLY:prior-stop:' + str(value['user_stop_epoch'])
        value['last_original_stop_receipt_sha256'] = digest(self.codec.storage_pack({'prior_stop': value['user_stop_epoch']}))
        self.owners['host_stop'].issue(self.stop_key, 'producer', CANCEL + '#/$defs/StopControl', value)
        self.stop = value

    def recover(self, selector):
        # The immutable result, not disposed old mutable source bytes, decides.
        return self.read_result(selector)

    def withdraw(self, selector, withdrawal_id='withdrawal:W12b', helper=lambda boundary: None):
        self.bank.validate('MigrationSelector', selector)
        require('M12/withdraw_selector', equal(selector, self.selector()))
        before = self.fence()
        self.guard(before)
        original = None
        if self.migration_id in self.results:
            self.read_result(selector)
            g = scoped_key(self.scope)
            key = 'goal_binding_migration_result.v1:' + g + ':' + self.migration_id.encode().hex()
            original = self.selection(key, self.results[self.migration_id], self.bank.schema['$id'] + '#/$defs/MigrationResult')
        fenced = self.results[self.migration_id]['writer_domain'] if original is not None else self.pre_domain()
        preserved = {p for owner in self.owners.values() for p in owner.pending}
        cancellation_pending = self.current_body_control.get('cancellation_pending')
        if cancellation_pending is not None:
            preserved.add(cancellation_pending['operation_id'])
        result = dict(scope=copy.deepcopy(self.scope), migration_id=self.migration_id, withdrawal_id=withdrawal_id,
            disposition='withdrawn', original_result=original, fenced_writer_domain=copy.deepcopy(fenced),
            preserved_pending_operation_ids=sorted(preserved))
        self.bank.validate('MigrationWithdrawalResult', result)
        helper(self)
        self.guard(before)
        key = 'goal_binding_migration_withdrawal.v1:' + scoped_key(self.scope) + ':' + withdrawal_id.encode().hex()
        require('M12/withdrawal_absent', key not in self.cells)
        raw = self.codec.storage_pack(result)
        require('M12/withdrawal_size', len(self.codec.storage_pack({'physical_key': key, 'value': result})) <= 16384)
        self.withdrawn, self.withdrawals, self.cells = True, {**self.withdrawals, withdrawal_id: copy.deepcopy(result)}, {**self.cells, key: raw}
        return result
