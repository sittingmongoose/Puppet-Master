"""Newly authored TEST_ONLY physical source for selected goal.updated v3.

Copied into an explicitly pinned successor before any owner import. Uses the
UNCHANGED selected Case L-2 codec; semantic Goal/JCS recipes are independent.
The pack/index sync is real filesystem I/O. Goal/redb transaction atomicity is
still a bounded model, never native certification.
"""
from __future__ import annotations
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import sys
import threading
import weakref

import blake3
import zstandard
from jsonschema import Draft202012Validator

BASE = Path(__file__).parent
_spec = importlib.util.spec_from_file_location('w12a_selected_case_l2', BASE/'runtime/shared/event_value_codec.py')
WIRE = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = WIRE
_spec.loader.exec_module(WIRE)
pack, unpack = WIRE.pack, WIRE.unpack
SCHEMA_BYTES = (BASE/'physical-v3.schema.json').read_bytes()
SCHEMA_SHA256 = hashlib.sha256(SCHEMA_BYTES).hexdigest()
SCHEMA = json.loads(SCHEMA_BYTES)
Draft202012Validator.check_schema(SCHEMA)
VALIDATOR = Draft202012Validator(SCHEMA)
INDEX_VALIDATOR = Draft202012Validator(SCHEMA['$defs']['index_entry'])
REFERENCE_VALIDATOR = Draft202012Validator(SCHEMA['$defs']['reference_operation'])
LIMIT = 16384
EDITION = 'pm.goal.updated.physical.v3'
MEDIA = 'application/vnd.puppetmaster.goal-value+msgpack'
LOCK = threading.RLock()
_STORE = None

class Unavailable(ValueError):
    pass


def need(ok, name):
    if not ok:
        raise Unavailable(name)


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def value_bytes(value):
    try:
        return pack(value)
    except WIRE.WireError as error:
        raise Unavailable('physical/shared_codec_unavailable/'+str(error)) from error


def identity(value):
    """Lifetime/source join comes from the actual inner owner record."""
    record = value['record']
    return {**{key: record.get(key) for key in ('storage_instance_id', 'project_id', 'thread_id', 'goal_id')},
            'operation_id': record.get('operation_id',record.get('normalized_identity',{}).get('operation_id'))}


def lifetime(value):
    schema = value['schema_id']
    return 'bound_thread' if any(x in schema for x in ('body_record.', 'objective_revision.', 'objective_origin.', 'body_control.', 'input_content.')) else 'authority_indefinite'


def envelope(value):
    raw = value_bytes(value)
    result = dict(schema_id=EDITION, schema_version='3.0.0', logical_schema_id=value['schema_id'],
                  logical_schema_version=value['schema_version'], owner_identity_sha256=digest(value_bytes(identity(value))),
                  source_lifetime=lifetime(value), value_sha256=digest(raw), record=value,
                  payload_ref=None)
    if len(value_bytes(result)) > LIMIT:
        result['record'] = None
        result['payload_ref'] = dict(id=blake3.blake3(raw).hexdigest(), size=len(raw), media_type=MEDIA)
    VALIDATOR.validate(result)
    need(len(value_bytes(result)) <= LIMIT, 'physical/complete_wrapper_limit')
    return result


def encode(value):
    """Pure physical recipe. Cannot repair a missing pack on any read."""
    return value_bytes(envelope(value))


def select(path):
    global _STORE
    need(_STORE is None, 'physical/selection_once_before_birth')
    _STORE = PayloadOwner(path)
    return _STORE


def selected():
    need(type(_STORE) is PayloadOwner, 'physical/explicit_selected_payload_owner')
    _STORE.admit()
    return _STORE


class PayloadOwner:
    """One append-only pack plus length-delimited canonical index entries.

    Index rows have the same 16 KiB bound as other stored parts. No file per
    payload; identical values share one entry. References are established only
    by publish(), after the original owner installs its exact rows.
    """
    def __init__(self, path):
        self.path = Path(path).resolve()
        self.path.mkdir(parents=True, exist_ok=False)
        self.available = self.allowed = self.source_live = True
        self.index = {}
        self.references = {}
        self._original_index = {}
        self._original_references = {}
        self._sources = weakref.WeakKeyDictionary()
        self.pack_path = self.path/'payload.pack'
        self.index_path = self.path/'payload.index'
        self.reference_path = self.path/'payload.references'
        for p in (self.pack_path, self.index_path, self.reference_path):
            with p.open('xb') as stream:
                stream.flush(); os.fsync(stream.fileno())
        fd = os.open(self.path, os.O_RDONLY)
        try: os.fsync(fd)
        finally: os.close(fd)
        self._paths = (self.path, self.pack_path, self.index_path, self.reference_path)
        self.cuts = []
        self.cut = None  # interruption injection, not an authentication fact

    def admit(self):
        need(hashlib.sha256((BASE/'physical-v3.schema.json').read_bytes()).hexdigest() == SCHEMA_SHA256, 'physical/current_physical_schema')
        need(self.available is True, 'physical/payload_available')
        need(self.allowed is True, 'physical/payload_access')
        need(self.source_live is True, 'physical/payload_source_lifetime')
        need((self.path, self.pack_path, self.index_path, self.reference_path) == self._paths, 'physical/exact_pack_selection')
        need(value_bytes(self.index) == value_bytes(self._original_index), 'physical/original_index')
        need(value_bytes(self.references) == value_bytes(self._original_references), 'physical/original_references')
        need(value_bytes(self.reference_rows()) == value_bytes(self.references), 'physical/durable_reference_origin')

    def step(self, name):
        self.cuts.append(name)
        if self.cut == name:
            raise Unavailable('physical/interrupted/'+name)

    def stage(self, value):
        with LOCK:
            self.admit()
            outer = envelope(value)
            ref = outer['payload_ref']
            if ref is None:
                return encode(value)
            raw = value_bytes(value)
            self.candidate_origin(value, outer)
            if ref['id'] in self.index:
                need(self._read(ref, outer, candidate=value) == raw, 'physical/dedupe_exact_bytes')
                return encode(value)
            # MessagePack text-containing payloads follow SP-337 zstd level 3.
            compressed = zstandard.ZstdCompressor(level=3).compress(raw)
            offset = self.pack_path.stat().st_size
            entry = dict(id=ref['id'], size=len(raw), media_type=MEDIA, offset=offset,
                         stored_size=len(compressed), compression='zstd-3', sha256=digest(raw))
            INDEX_VALIDATOR.validate(entry)
            index_raw = value_bytes(entry)
            need(len(index_raw) <= LIMIT, 'physical/complete_index_limit')
            self.step('before_pack')
            with self.pack_path.open('ab') as stream:
                stream.write(compressed); stream.flush(); os.fsync(stream.fileno())
            self.step('pack_synced')
            with self.index_path.open('ab') as stream:
                stream.write(len(index_raw).to_bytes(4, 'big')+index_raw)
                stream.flush(); os.fsync(stream.fileno())
            self.step('index_synced')
            self.index[ref['id']] = entry
            self._original_index[ref['id']] = dict(entry)
            need(self._read(ref, outer, candidate=value) == raw, 'physical/durable_before_reference')
            self.step('before_reference')
            return encode(value)

    def read(self, ref, outer):
        return self._read(ref, outer)

    def _read(self, ref, outer, candidate=None):
        with LOCK:
            self.admit()
            VALIDATOR.validate(outer)
            need(len(value_bytes(outer)) <= LIMIT, 'physical/complete_wrapper_limit')
            need(value_bytes(ref) == value_bytes(outer['payload_ref']), 'physical/read_reference_join')
            self.source(outer)
            if candidate is None: self.original_row(outer)
            else: self.candidate_origin(candidate, outer)
            need(type(ref) is dict and set(ref) == {'id', 'size', 'media_type'}, 'physical/reference_members')
            need(type(ref['id']) is str and len(ref['id']) == 64 and all(c in '0123456789abcdef' for c in ref['id']), 'physical/reference_id')
            need(type(ref['size']) is int and ref['size'] >= 0, 'physical/reference_size_type')
            need(ref['media_type'] == MEDIA, 'physical/reference_media')
            entry = self.index.get(ref['id'])
            need(entry is not None, 'physical/missing_payload')
            need({k: entry[k] for k in ref} == ref, 'physical/reference_index_join')
            # Independently re-read the durable index; a supplied in-memory map
            # or a transport-shaped digest cannot establish original custody.
            found = []
            with self.index_path.open('rb') as stream:
                while size := stream.read(4):
                    need(len(size) == 4, 'physical/index_truncated')
                    n = int.from_bytes(size, 'big')
                    need(n <= LIMIT, 'physical/complete_index_limit')
                    data = stream.read(n)
                    need(len(data) == n, 'physical/index_truncated')
                    row = unpack(data)
                    INDEX_VALIDATOR.validate(row)
                    if row.get('id') == ref['id']: found.append(row)
            need(found and all(value_bytes(x) == value_bytes(entry) for x in found), 'physical/durable_index_origin')
            with self.pack_path.open('rb') as stream:
                stream.seek(entry['offset']); compressed = stream.read(entry['stored_size'])
            need(len(compressed) == entry['stored_size'], 'physical/pack_truncated')
            try:
                raw = zstandard.ZstdDecompressor().decompress(compressed, max_output_size=entry['size'])
            except zstandard.ZstdError as error:
                raise Unavailable('physical/pack_decode') from error
            need(len(raw) == ref['size'] and blake3.blake3(raw).hexdigest() == ref['id'] and digest(raw) == entry['sha256'], 'physical/exact_original_payload')
            self.admit()
            self.source(outer)
            if candidate is None: self.original_row(outer)
            else: self.candidate_origin(candidate, outer)
            return raw

    def bind(self, physical):
        # Source authenticity is actual original enrolled class/root custody,
        # never an owner-shaped transport value or caller admission bit.
        import goal_command as C
        semantic = physical.source
        need(type(physical) is C.A.PhysicalOwner and physical in C.A._PHYSICAL_BIRTHS
             and type(semantic) is C.M.ModelStore and semantic in C.M._SEMANTIC_BIRTHS,
             'physical/original_owner_birth')
        start = physical._command_owner
        need(start is not None and semantic._goal_start_owner is start
             and C.M._GOAL_ENROLLMENTS.get(semantic) == (physical,start,start.sir,start.root,start.shared,start.token),
             'physical/original_owner_enrollment')
        with start.root:
            current = semantic.canonical
            need(current is not None and semantic._issued.get(id(current)) == C.M.digest(current),
                 'physical/original_body_source')
            C.M.validate_snapshot(current)
            body = current['body']
            scope = dict(storage_instance_id=semantic.instance,
                         **{k:body[k] for k in ('project_id','thread_id','goal_id')})
            prior = self._sources.get(physical)
            need(prior is None or prior == scope, 'physical/immutable_owner_scope')
            self._sources[physical] = scope

    def source(self, outer):
        import goal_command as C
        import goal_update_support as U
        # Resolve the compact identity commitment only from actual retained
        # owner roots. A caller cannot select a weaker scope or source lifetime.
        need(outer['source_lifetime'] == lifetime({'schema_id':outer['logical_schema_id']}),
             'physical/source_lifetime_selection')
        matches = []
        for physical,original_scope in self._sources.items():
            semantic = physical.source
            schema = outer['logical_schema_id']
            candidates = []
            if schema in physical.family_schema_ids.values():
                family = next(k for k,v in physical.family_schema_ids.items() if v == schema)
                kind = C.A.FAMILIES[family]
                snapshot = semantic.canonical
                if kind == 'receipt': records = list(semantic.receipts.values())
                elif snapshot is None: records = []
                elif kind in ('body','control'): records = [snapshot[kind]]
                elif kind == 'revision': records = snapshot['revisions']
                else: records = list(snapshot['origins'].values())
                candidates = [(identity(dict(schema_id=schema,record=r)),r.get('operation_id')) for r in records]
                # A staged new receipt has original uncommitted participation.
                if kind == 'receipt':
                    for part in C.M._UPDATE_PARTICIPATIONS.values():
                        enrollment = part.get('enrollment')
                        if type(enrollment) is tuple and enrollment[0] is semantic and part.get('receipt') is not None:
                            r=part['receipt'];candidates.append((identity(dict(schema_id=schema,record=r)),r['operation_id']))
            elif schema in {'pm.storage_value.'+f+'.v1' for f in U.FAMILIES.values()}:
                for key,enrollment in C.M._GOAL_UPDATE_ENROLLMENTS.items():
                    if key[0] is semantic:
                        sir = enrollment[3];source = sir._update_state['source'];operation = key[1]
                        candidate = (identity(dict(record=source)) if schema == 'pm.storage_value.goal_update_source_audit.v1' else
                                     {**{k:source[k] for k in ('storage_instance_id','project_id','thread_id','goal_id')},'operation_id':operation})
                        candidates.append((candidate,operation))
            for candidate,operation in candidates:
                if digest(value_bytes(candidate)) == outer['owner_identity_sha256']:
                    matches.append((physical,original_scope,operation))
        # The same immutable identity occurs across accepted objective revisions;
        # only actual owner/root and operation identity, not the live revision,
        # chooses authority. Retained history is not read as current body.
        unique = {(id(p),op):(p,scope,op) for p,scope,op in matches}
        need(len(unique) == 1, 'physical/exact_original_source')
        physical, original_scope, operation = next(iter(unique.values()))
        semantic = physical.source
        start = physical._command_owner
        need(type(physical) is C.A.PhysicalOwner and physical in C.A._PHYSICAL_BIRTHS
             and type(semantic) is C.M.ModelStore and semantic in C.M._SEMANTIC_BIRTHS
             and semantic._goal_start_owner is start
             and C.M._GOAL_ENROLLMENTS.get(semantic) == (physical,start,start.sir,start.root,start.shared,start.token),
             'physical/original_owner_enrollment')
        need(semantic.allowed is True and semantic.audit_allowed is True, 'physical/current_source_permission')
        need(all(getattr(semantic,k) is True for k in ('registered','installed','migration_valid','backup_valid',
             'receipt_registered','receipt_installed','receipt_migration_valid','receipt_backup_valid')),
             'physical/current_original_installation')
        need(semantic.instance == original_scope['storage_instance_id'], 'physical/current_storage_identity')
        if 'goal_update_' in outer['logical_schema_id']:
            enrollment = C.M._GOAL_UPDATE_ENROLLMENTS.get((semantic,operation))
            need(type(enrollment) is tuple and len(enrollment) == 9 and enrollment[0] is semantic
                 and enrollment[1] is physical and enrollment[8] == operation,
                 'physical/original_update_enrollment')
            command,sir,root,shared = enrollment[2:6]
            need(command.sir is sir and command.root is root and command.shared is shared
                 and sir.command is command and command.token is sir.token,
                 'physical/exact_update_participants')
            need(command.available is True and command.allowed is True and command.audit_allowed is True
                 and all(getattr(command,k) is True for k in ('registered','installed','migration_valid','backup_valid'))
                 and sir.available is True and sir.allowed is True and shared.available is True and shared.allowed is True,
                 'physical/current_update_permission')
            if 'input_content' in outer['logical_schema_id']:
                need(sir.input_allowed is True, 'physical/current_input_permission')
        if outer['source_lifetime'] == 'bound_thread':
            need(semantic.deleted is False and semantic.canonical is not None, 'physical/bound_thread_lifetime')
        U.graph_current()
        return physical

    def original_row(self, outer):
        # Original physical issuance is independent of a caller's scope/ref.
        physical = self.source(outer)
        raw = value_bytes(outer)
        matches = []
        for cells,origins in ((physical._cells,physical._issued),
                              (physical._update_cells,physical._update_issued)):
            for key,cell in cells.items():
                if cell['raw'] == raw and origins.get(key) == (id(cell),raw):
                    matches.append((key,cell))
        need(len(matches) == 1, 'physical/original_physical_row')
        return matches[0]

    def candidate_origin(self, value, outer):
        import goal_command as C
        import goal_source as S
        import goal_update_support as U
        physical = self.source(outer)
        semantic = physical.source
        start = physical._command_owner
        need(start.root._is_owned(), 'physical/stage_original_root_held')
        need(encode(value) == value_bytes(outer), 'physical/stage_complete_candidate')
        candidates = []
        schema = value['schema_id']
        if 'goal_update_' in schema:
            operation = identity(value)['operation_id']
            enrollment = C.M._GOAL_UPDATE_ENROLLMENTS.get((semantic,operation))
            sir = enrollment[3]
            need(sir in S._UPDATE_SOURCE_BIRTHS
                 and U.h(sir._update_state) == S._UPDATE_SOURCE_SEALS.get(sir),
                 'physical/stage_original_source')
            state = sir._update_state
            if schema == 'pm.storage_value.goal_update_source_audit.v1':
                candidates.append(U.row('SourceAudit',state['source']))
            elif schema == 'pm.storage_value.goal_update_input_content.v1':
                candidates.append(U.row('InputContent',state['input']))
            for participation in C.M._UPDATE_PARTICIPATIONS.values():
                if participation.get('enrollment') is enrollment:
                    for kind,record in participation['records']:
                        candidates.append(U.row(kind,record))
        else:
            snapshots = [semantic.canonical]
            receipts = list(semantic.receipts.values())
            for participation in C.M._UPDATE_PARTICIPATIONS.values():
                enrollment = participation.get('enrollment')
                if type(enrollment) is tuple and enrollment[0] is semantic:
                    if participation.get('snapshot') is not None:
                        snapshots.append(participation['snapshot'])
                    if participation.get('receipt') is not None:
                        receipts.append(participation['receipt'])
            for snapshot in snapshots:
                if snapshot is None: continue
                for kind,record in [('body',snapshot['body']),('control',snapshot['control'])]+[('revision',r) for r in snapshot['revisions']]+[('origin',r) for r in snapshot['origins'].values()]:
                    candidates.append(C.A.wrap(C.A.KINDS[kind],record))
            candidates += [C.A.wrap(C.A.KINDS['receipt'],r) for r in receipts]
        need(any(value_bytes(v) == value_bytes(value) for v in candidates),
             'physical/stage_actual_owner_candidate')

    def reference_rows(self):
        result = {}
        with self.reference_path.open('rb') as stream:
            while prefix := stream.read(4):
                need(len(prefix) == 4, 'physical/reference_log_truncated')
                n = int.from_bytes(prefix,'big')
                need(n <= LIMIT, 'physical/complete_reference_operation_limit')
                raw = stream.read(n)
                need(len(raw) == n, 'physical/reference_log_truncated')
                row = unpack(raw)
                REFERENCE_VALIDATOR.validate(row)
                need(set(row) == {'namespace','operation','row_key_sha256','reference'}, 'physical/reference_operation_members')
                rows = result.setdefault(row['namespace'],{})
                if row['operation'] == 'acquire':
                    need(row['row_key_sha256'] not in rows, 'physical/reference_acquire_once')
                    rows[row['row_key_sha256']] = row['reference']
                elif row['operation'] == 'release':
                    need(rows.get(row['row_key_sha256']) == row['reference'], 'physical/exact_reference_release')
                    del rows[row['row_key_sha256']]
                else: raise Unavailable('physical/reference_operation')
        return result

    def reference_counts(self):
        self.admit()
        result = {}
        for rows in self.references.values():
            for ref in rows.values():
                result[ref['payload_id']] = result.get(ref['payload_id'],0)+1
        return result

    def publish(self, physical, namespace):
        """Called inside the real original owner's held publication section."""
        with LOCK:
            self.admit()
            self.bind(physical)
            need(namespace in ('body','update'), 'physical/exact_publication_namespace')
            need(physical._command_owner.root._is_owned(), 'physical/publication_original_root_held')
            cells = physical._cells if namespace == 'body' else physical._update_cells
            origins = physical._issued if namespace == 'body' else physical._update_issued
            refs = {}
            for key, cell in cells.items():
                need(origins.get(key) == (id(cell),cell['raw']), 'physical/publication_actual_cell_origin')
                outer = unpack(cell['raw'])
                VALIDATOR.validate(outer)
                decode(cell['raw'])
                if outer['payload_ref'] is not None:
                    # This is a compact non-authoritative pack-reference index;
                    # exact original key/identity still lives with its owner.
                    row_key = digest(repr(key).encode('utf-8'))
                    refs[row_key] = dict(payload_id=outer['payload_ref']['id'],
                        row_physical_sha256=digest(cell['raw']),
                        source_identity_sha256=outer['owner_identity_sha256'],
                        source_lifetime=outer['source_lifetime'])
            before = self.references.get(namespace,{})
            operations = []
            for key,ref in before.items():
                if refs.get(key) != ref:
                    operations.append(dict(namespace=namespace,operation='release',row_key_sha256=key,reference=ref))
            for key,ref in refs.items():
                if before.get(key) != ref:
                    operations.append(dict(namespace=namespace,operation='acquire',row_key_sha256=key,reference=ref))
            for operation in operations:
                REFERENCE_VALIDATOR.validate(operation)
                raw = value_bytes(operation)
                need(len(raw) <= LIMIT, 'physical/complete_reference_operation_limit')
                with self.reference_path.open('ab') as stream:
                    stream.write(len(raw).to_bytes(4,'big')+raw)
                    stream.flush();os.fsync(stream.fileno())
            # An empty namespace has no durable row. Do not invent one while
            # replaying the reference log.
            if refs or namespace in self.references:
                self.references[namespace] = refs
                self._original_references[namespace] = json.loads(json.dumps(refs))
            self.admit()


def stage(value):
    return selected().stage(value)


def publish(physical, namespace):
    return selected().publish(physical, namespace)

def bind(physical):
    return selected().bind(physical)


def decode(raw):
    need(type(raw) is bytes and len(raw) <= LIMIT, 'physical/complete_wrapper_limit')
    outer = unpack(raw)
    VALIDATOR.validate(outer)
    need(outer['schema_id'] == EDITION, 'physical/exact_edition')
    ref = outer['payload_ref']
    selected().source(outer)
    value = outer['record'] if ref is None else unpack(selected().read(ref, outer))
    need(type(value) is dict and set(value) == {'schema_id', 'schema_version', 'record'}, 'physical/logical_wrapper')
    need(value['schema_id'] == outer['logical_schema_id'] and value['schema_version'] == outer['logical_schema_version'], 'physical/logical_schema_join')
    need(digest(value_bytes(identity(value))) == outer['owner_identity_sha256'] and lifetime(value) == outer['source_lifetime'], 'physical/source_identity_lifetime_join')
    need(digest(value_bytes(value)) == outer['value_sha256'], 'physical/whole_value_commitment')
    need(encode(value) == raw, 'physical/exact_canonical_representation')
    return value
