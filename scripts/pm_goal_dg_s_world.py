#!/usr/bin/env python3
"""DG-S TEST_ONLY world for goal_run.started (W3): whole-root banks, owner
binding and the independently issuing source owners.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Every value an owner issues here is a whole value under its exact original
root, validated against the pinned original bank at issue, and kept in that
owner's private custody (``pm_goal_test_owner_adapters.TestOwner``). The
structural skeleton of a root comes from the schema itself; every identity,
scope, owner, Storage instance, physical key, time and selector is bound by the
issuing owner from its own execution (the TEST_ONLY Storage instance, its
monotonic clock, its transaction ids and K(s) keys). Every selector an owner
issues points at a Storage cell that the same owner wrote, so a reader can
resolve it independently and recompute its physical SHA-256. Nothing here
authenticates a production-native transaction, installation or durability.
"""
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path
import uuid

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
from pm_goal_own_c3_w34_oracles import specimen
from pm_goal_own_c3_w34_reference_oracles import select_bank
from pm_goal_own_c_roots import OriginalBank
from pm_goal_own_c_oracles import ROOT, Refusal as OldRefusal

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
PLACEHOLDER_HEX = 'a' * 64
HEX_PATTERNS = ('^[0-9a-f]{64}$', '^[a-f0-9]{64}$')
SKELETON_TIME = '2026-11-05T09:00:00Z'


class DGRefusal(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code


def require(code, condition):
    if not condition:
        raise DGRefusal(code)


def code_of(error):
    for attr in ('code', 'reason'):
        value = getattr(error, attr, None)
        if isinstance(value, str):
            return value
    if isinstance(error, OldRefusal):
        return str(error)
    return 'EXCEPTION:' + type(error).__name__ + ':' + str(error)[:160]


REFUSALS = (DGRefusal, A.AdapterRefusal, S.StorageRefusal, NR.NumruleRefusal, OldRefusal)


def sha256(raw):
    return hashlib.sha256(raw).hexdigest()


def cdigest(value):
    """SHA-256 of Storage canonical MessagePack (the cell codec)."""
    return sha256(S.canonical(value, 'dg_s/digest'))


def activation_source_json(value):
    """``pm.workflow.activation_source_json.v1`` digest input: exact JSON,
    sorted keys, exact integers, no floats (adapter exact_json codec)."""
    return A.exact_json(value, 'dg_s/activation_source_json')


def source_argument_sha256(value):
    return sha256(activation_source_json(value))


def K(value):
    return S.k_component(value)


def same(a, b):
    return A.same(a, b)


# ------------------------------------------------------------------ banks

class Bank:
    """Adapter around an isolated original bank: ``validate(root, value, code)``."""

    def __init__(self, original, name):
        self.original = original
        self.name = name
        self.registry = original.registry

    def errors(self, root, value):
        return self.original.errors(root, value)

    def validate(self, root, value, code='root'):
        errors = self.errors(root, value)
        if errors:
            error = sorted(errors, key=lambda e: list(e.absolute_path))[0]
            raise A.AdapterRefusal(code + '/schema/' + '/'.join(str(p) for p in error.absolute_path)
                                   + ':' + str(error.validator))
        return value

    def lookup(self, root):
        return self.registry.resolver().lookup(root)


class Edition:
    """One explicitly selected source edition and its isolated whole banks."""

    def __init__(self, name, bank, goal_bank, *, custody, d01, activation, consumer, goal_arg, profile,
                 selection=None):
        self.name = name
        self.bank = bank
        self.goal_bank = goal_bank
        self.custody, self.d01, self.activation = custody, d01, activation
        self.consumer, self.goal_arg = consumer, goal_arg
        self.profile = profile
        self.selection = selection

    def root(self, uri, name):
        return uri + '#/$defs/' + name


_EDITIONS = {}


def v3_edition():
    if 'v3' not in _EDITIONS:
        original, selection = select_bank('started')
        resources = json.loads((ROOT / 'Plans/goal_run_started_consumer_schema_resources.json').read_text())
        locations = json.loads((ROOT / 'Plans/goal_run_projection_reference_contracts/original-locations.json').read_text())
        goal = OriginalBank(resources['realms']['current_goal_controls'], locations)
        _EDITIONS['v3'] = Edition(
            'v3_profile', Bank(original, 'current_workflow_native_activation+started.reference.v1'),
            Bank(goal, 'current_goal_controls'),
            custody='https://puppetmaster.local/proposals/workflow_start_original_custody.v2.schema.json',
            d01='https://puppetmaster.local/proposals/executor_workflow_original_start.v2.schema.json',
            activation='https://puppetmaster.local/proposals/workflow_activation_sources.v4.schema.json',
            consumer='https://puppetmaster.local/proposals/goal_run_started_consumer.v1.schema.json',
            goal_arg='https://puppetmaster.local/proposals/workflow_start_goal_argument.v2.schema.json',
            profile='workflow_start_original.v2', selection=selection)
        _methods(_EDITIONS['v3'])
    return _EDITIONS['v3']


def _methods(edition):
    origin = skeleton(edition.bank, edition.custody + '#/$defs/StorageOrigin')['record']
    edition.start_method = origin['issuer_method']
    edition.storage_method = origin['storage_method']
    return edition


# ------------------------------------------------------------------ skeletons

_SKELETONS = {}


def _leaves(errors):
    for error in errors:
        if error.context:
            yield from _leaves(error.context)
        else:
            yield error


def _set(value, path, replacement):
    if not path:
        return replacement
    target = value
    for key in path[:-1]:
        target = target[key]
    target[path[-1]] = replacement
    return value


def _get(value, path):
    for key in path:
        value = value[key]
    return value


def repair(bank, root, value):
    """Make the schema-derived skeleton satisfy its whole root (conditional
    consts, enums, exact-count ``contains``). The skeleton carries no identity:
    owners bind every identity-bearing member at issue."""
    for _ in range(80):
        errors = list(bank.errors(root, value))
        if not errors:
            return value
        changed = False
        contains = {}
        leaves = sorted(_leaves(errors), key=lambda e: e.validator == 'pattern')  # pattern fixes last
        for error in leaves:
            path = list(error.absolute_path)
            kind = error.validator
            if kind == 'pattern' and error.validator_value in HEX_PATTERNS:
                value = _set(value, path, PLACEHOLDER_HEX); changed = True
                continue
            if kind == 'const':
                value = _set(value, path, copy.deepcopy(error.validator_value)); changed = True
            elif kind == 'enum':
                value = _set(value, path, copy.deepcopy(error.validator_value[0])); changed = True
            elif kind == 'type':
                expected = error.validator_value
                expected = expected[0] if isinstance(expected, list) else expected
                value = _set(value, path, {'string': 'x', 'integer': 1, 'boolean': True, 'null': None,
                                           'array': [], 'object': {}, 'number': 1}[expected]); changed = True
            elif kind in ('contains', 'minContains', 'maxContains'):
                schema = error.schema.get('contains', {})
                for prop, spec in schema.get('properties', {}).items():
                    if 'const' in spec:
                        contains.setdefault(tuple(path), (prop, []))[1].append(spec['const'])
        for path, (prop, consts) in contains.items():
            array = _get(value, list(path))
            template = array[0] if array else {}
            kept, seen = [], []
            for item in array:  # keep one entry per distinct value already present
                if type(item) is dict and item.get(prop) not in seen:
                    seen.append(item.get(prop))
                    kept.append(item)
            for c in consts:
                if c not in seen:
                    seen.append(c)
                    kept.append(dict(copy.deepcopy(template), **{prop: c}))
            value = _set(value, list(path), kept)
            changed = True
        if not changed:
            first = errors[0]
            raise DGRefusal('skeleton/unrepairable/%s/%s:%s' % (root.split('#')[-1], '/'.join(
                str(p) for p in first.absolute_path), first.validator))
    last = [(list(e.absolute_path)[-4:], e.validator, str(e.validator_value)[:60]) for e in _leaves(bank.errors(root, value))][:3]
    raise DGRefusal('skeleton/repair_limit/%s/%r' % (root.split('#')[-1], last))


def skeleton(bank, root):
    key = (bank.name, root)
    if key not in _SKELETONS:
        resolved = bank.lookup(root)
        value = specimen([(resolved.contents, resolved.resolver)])
        _SKELETONS[key] = repair(bank, root, value)
    return copy.deepcopy(_SKELETONS[key])


# ------------------------------------------------------------------ binding

SCOPE_KEYS = {'storage_instance_id', 'project_id', 'goal_id', 'goal_run_id'}
IDENTITY_KEYS = {'project_id', 'goal_id', 'goal_run_id', 'plan_compile_run_id', 'workgraph_id', 'workgraph_revision',
                 'workgraph_ref', 'workgraph_sha256'}
OWNER_KEYS = {'owner_ref', 'owner_epoch', 'server_id', 'server_claim_epoch'}
SELECTOR_KEYS = {'storage_instance_id', 'family_id', 'physical_key', 'schema_id', 'schema_version'}
TIME_KEYS = ('_at_utc', '_at')


def is_selector(node):
    return (type(node) is dict and SELECTOR_KEYS <= set(node) and len(node) == 6 and
            ('physical_value_sha256' in node or 'physical_sha256' in node))


def selector_hash_field(node):
    return 'physical_value_sha256' if 'physical_value_sha256' in node else 'physical_sha256'


def walk_selectors(value, path=()):
    if is_selector(value):
        yield path, value
        return
    if type(value) is dict:
        for k, v in value.items():
            yield from walk_selectors(v, path + (k,))
    elif type(value) is list:
        for i, v in enumerate(value):
            yield from walk_selectors(v, path + (i,))


class Context:
    """The run this world births: values from the Storage instance and owners."""

    def __init__(self, storage, project_id, goal_id, goal_run_id, thread_id, token):
        self.storage = storage
        self.sid = storage.storage_instance_id
        self.project_id, self.goal_id, self.goal_run_id = project_id, goal_id, goal_run_id
        self.thread_id = thread_id
        self.token = token
        self.scope = dict(storage_instance_id=self.sid, project_id=project_id, goal_id=goal_id,
                          goal_run_id=goal_run_id)
        self.workgraph_id = 'TEST_ONLY:workgraph:' + token
        self.workgraph_ref = 'TEST_ONLY:workgraph-ref:' + token
        self.plan_compile_run_id = 'TEST_ONLY:plan-compile-run:' + token
        self.workgraph_revision = 1
        self.workgraph_sha256 = None  # bound when the installed graph is issued
        self.workflow_owner = dict(owner_ref='TEST_ONLY:workflow-owner:' + token, owner_epoch=3,
                                   server_id='TEST_ONLY:server:' + token, server_claim_epoch=4)

    def identity(self):
        require('context/workgraph_sha256', self.workgraph_sha256 is not None)
        return dict(project_id=self.project_id, goal_id=self.goal_id, goal_run_id=self.goal_run_id,
                    plan_compile_run_id=self.plan_compile_run_id, workgraph_id=self.workgraph_id,
                    workgraph_revision=self.workgraph_revision, workgraph_ref=self.workgraph_ref,
                    workgraph_sha256=self.workgraph_sha256)

    def run_key(self, family, *extra):
        parts = [family, K(self.sid), K(self.project_id), K(self.goal_id), K(self.goal_run_id)]
        return ':'.join(parts + [K(str(e)) for e in extra])

    def now(self):
        """The TEST_ONLY Storage instance's own monotonic UTC clock."""
        return self.storage._tick()


def derived_value(ctx, key, kind='hex'):
    """A per-world deterministic value for an unjoined skeleton leaf. Same key,
    same value, so the skeleton's equality joins survive; never a constant."""
    raw = S.binding(['pm.goal_test.dg_s.bound_leaf.v1', ctx.token, key, kind])
    return sha256(raw) if kind == 'hex' else 'TEST_ONLY:%s:%s' % (key, sha256(raw)[:16])


class Binder:
    """Binds a skeleton to the world. Selector targets become Storage cells
    written by the issuing owner in one transaction."""

    def __init__(self, ctx, owner_id, family_prefix):
        self.ctx = ctx
        self.owner_id = owner_id
        self.prefix = family_prefix
        self.writes = []
        self._cells = {}

    def bind(self, value, path=()):
        ctx = self.ctx
        if type(value) is dict:
            keys = set(value)
            if keys == SCOPE_KEYS:
                return copy.deepcopy(ctx.scope)
            if keys == IDENTITY_KEYS and ctx.workgraph_sha256 is not None:
                return ctx.identity()
            if keys == OWNER_KEYS:
                return copy.deepcopy(ctx.workflow_owner)
            if is_selector(value):
                return self.selector(value, path)
            return {k: self.leaf(k, self.bind(v, path + (k,)), path + (k,)) for k, v in value.items()}
        if type(value) is list:
            return [self.bind(v, path + (i,)) for i, v in enumerate(value)]
        return value

    def leaf(self, key, value, path):
        ctx = self.ctx
        if type(value) is not str:
            return value
        if key == 'storage_instance_id':
            return ctx.sid
        if key == 'goal_run_id':
            return ctx.goal_run_id
        if key == 'project_id':
            return ctx.project_id
        if key == 'goal_id':
            return ctx.goal_id
        if key == 'thread_id':
            return ctx.thread_id
        if key == 'workgraph_id':
            return ctx.workgraph_id
        if key == 'workgraph_ref':
            return ctx.workgraph_ref
        if key == 'plan_compile_run_id':
            return ctx.plan_compile_run_id
        if value == SKELETON_TIME:
            return ctx.now()
        if value == PLACEHOLDER_HEX:
            return derived_value(ctx, key, 'hex')
        if value == 'x':
            return derived_value(ctx, key, 'ref')
        return value

    def selector(self, node, path):
        ctx = self.ctx
        family = node['family_id']
        if family == 'x':
            family = 'TEST_ONLY_%s_%s' % (self.prefix, '_'.join(str(p) for p in path[-2:] if type(p) is str) or 'value')
        schema_id = node['schema_id'] if node['schema_id'] != 'x' else 'pm.storage_value.TEST_ONLY.%s.v1' % family
        schema_version = node['schema_version'] if node['schema_version'] != 'x' else '1.0.0'
        key = ctx.run_key(family, self.owner_id, self.prefix, '/'.join(str(p) for p in path))
        if key not in self._cells:
            record = dict(qualification=QUALIFICATION, family_id=family, schema_id=schema_id,
                          schema_version=schema_version, issuing_owner=self.owner_id,
                          path='/'.join(str(p) for p in path), scope=copy.deepcopy(ctx.scope))
            self._cells[key] = record
            self.writes.append(dict(table=family, key=key, expected=None, value=record))
        out = dict(storage_instance_id=ctx.sid, family_id=family, physical_key=key, schema_id=schema_id,
                   schema_version=schema_version)
        out[selector_hash_field(node)] = cdigest(self._cells[key])
        return out

    def commit(self):
        if self.writes:
            self.ctx.storage.transact(self.writes)
            self.writes = []


INLINE_CELL_LIMIT = 16000


def cell_value(storage, value):
    """Compact Storage cell for a source value: inline, or an SP-337 pack
    reference written durably before the referencing cell."""
    raw = S.canonical(value, 'dg_s/cell')
    if len(raw) <= INLINE_CELL_LIMIT:
        return value
    ref = storage.put_pack(raw, 'application/msgpack')
    return dict(qualification=QUALIFICATION, pack_backed=True, pack=ref, value_sha256=sha256(raw))


def put_values(ctx, rows, *, cut_before=None, cut_after=None, operation=None):
    writes = [dict(table=t, key=k, expected=None, value=cell_value(ctx.storage, v)) for t, k, v in rows]
    return ctx.storage.transact(writes, operation=operation, cut_before=cut_before, cut_after=cut_after)


def read_value(storage, table, key, where='read_value'):
    cell = storage.cell(table, key)
    if cell is None:
        return None
    value = cell['value']
    if type(value) is dict and value.get('pack_backed') is True:
        raw = storage.read_pack(value['pack'], expected_media_type='application/msgpack')
        require(where + '/pack_value_hash', sha256(raw) == value['value_sha256'])
        value = S.decode_canonical(raw, where)
    return dict(cell, value=value)


def selector_for(ctx, table, key, value, *, family_id=None, schema_id=None, schema_version=None, field='physical_value_sha256'):
    """Selector of a value this world actually wrote at (table, key)."""
    cell = read_value(ctx.storage, table, key, 'selector')
    require('selector/cell_present', cell is not None)
    require('selector/cell_value', same(cell['value'], value))
    out = dict(storage_instance_id=ctx.sid, family_id=family_id or table, physical_key=key,
               schema_id=schema_id or value.get('schema_id', 'pm.storage_value.TEST_ONLY.' + table),
               schema_version=schema_version or value.get('schema_version', '1.0.0'))
    out[field] = cdigest(value)
    return out


def resolve_selector(storage, selector, where='resolve'):
    """Independent resolution: the cell must exist and hash to the selector."""
    require(where + '/selector_type', is_selector(selector))
    require(where + '/selector_storage', selector['storage_instance_id'] == storage.storage_instance_id)
    cell = read_value(storage, selector['family_id'], selector['physical_key'], where)
    require(where + '/selector_unresolved', cell is not None)
    require(where + '/selector_hash', cdigest(cell['value']) == selector[selector_hash_field(selector)])
    return cell['value']


# ------------------------------------------------------------------ owners

class DGOwner(A.TestOwner):
    """TEST_ONLY family owner with reopenable private custody.

    ``save`` persists this owner's private custody (raw issued bytes) beside the
    Storage directory; ``load`` reopens it in a fresh process with the same owner
    id, and ``handle_for`` re-mints the owner's own handle for a retained ref.
    This is the owner reopening its own custody, never a caller rebuilding it.
    """

    role = 'dg_s_owner'

    def handle_for(self, ref):
        require('reopen/unissued', ref in self._originals)
        handle = A.OriginalHandle(self._originals[ref]['kind'])
        self._handles[handle] = ref
        return handle

    def save(self, directory):
        directory = Path(directory)
        directory.mkdir(parents=True, exist_ok=True)
        rows = [dict(ref=ref, root=r['root'], raw=r['raw'].hex(), sha256=r['sha256'], kind=r['kind'],
                     owner_epoch=r['owner_epoch'], issued_sequence=r['issued_sequence'])
                for ref, r in sorted(self._originals.items())]
        state = dict(owner_id=self.owner_id, role=self.role, owner_epoch=self.owner_epoch,
                     sequence=self._sequence, withdrawn=sorted(self.withdrawn), originals=rows,
                     extra=self.extra_state())
        S._atomic_write(directory / (sha256(self.owner_id.encode())[:24] + '.json'),
                        json.dumps(state, sort_keys=True).encode())

    def extra_state(self):
        return None

    def load_extra(self, extra):
        pass

    @classmethod
    def load(cls, registry, directory, owner_id, **kwargs):
        path = Path(directory) / (sha256(owner_id.encode())[:24] + '.json')
        state = json.loads(path.read_text())
        owner = cls(registry, owner_id=owner_id, owner_epoch=state['owner_epoch'], **kwargs)
        owner._sequence = state['sequence']
        owner.withdrawn = set(state['withdrawn'])
        for row in state['originals']:
            raw = bytes.fromhex(row['raw'])
            require('reopen/custody_hash', sha256(raw) == row['sha256'])
            owner._originals[row['ref']] = dict(root=row['root'], raw=raw, sha256=row['sha256'], kind=row['kind'],
                                                owner_id=owner_id, owner_epoch=row['owner_epoch'],
                                                issued_sequence=row['issued_sequence'])
        owner.load_extra(state['extra'])
        return owner


class WholeSourceOwner(DGOwner):
    """Issues one whole original value under its exact root, bound to the world."""

    role = 'whole_source'

    def __init__(self, registry, *, ctx=None, edition=None, kind_name=None, **kwargs):
        self.ctx = ctx
        self.edition = edition
        self.kind_name = kind_name or self.role.replace(':', '_')
        super().__init__(registry, **kwargs)

    def issue_whole(self, root, skeleton_value, *, kind=None, edit=None, prefix=None):
        binder = Binder(self.ctx, self.owner_id, prefix or self.kind_name)
        value = binder.bind(skeleton_value)
        if edit is not None:
            value = edit(value)
        binder.commit()
        return self.issue(root, value, kind=kind or self.kind_name)


def role_class(role_name, base=WholeSourceOwner):
    return type('DG_' + role_name.replace(':', '_').replace('.', '_'), (base,), {'role': role_name})


SEVEN_INPUTS = ('native_compile', 'compile_certification', 'aggregate_intake', 'test_capability',
                'model_resolution', 'worknode_request_set', 'source_control_preflight')
ACTIVATION_SOURCES = ('native_compile', 'certified_graph', 'native_intake', 'provisioning',
                      'activation_decision', 'completion_requirements', 'source_request')


def new_token():
    return uuid.uuid4().hex[:12]


# ------------------------------------------------------------------ native-v7 composition

V7_CONSUMER = 'https://puppetmaster.local/proposals/goal_run_started_consumer.native_v7.v1.schema.json'
V7_CUSTODY = 'https://puppetmaster.local/proposals/workflow_start_original_custody.v6.schema.json'
V7_D01 = 'https://puppetmaster.local/proposals/executor_workflow_original_start.v6.schema.json'
CERTIFIED = 'Plans/goal_run_certified_consumer_contracts/'


def _content_locations(declaration):
    from pm_goal_test_demo_r1 import content_index
    index = content_index()
    out = {}
    for entry in declaration['resources']:
        path = index.get(entry.get('sha256'))
        if path is not None:
            out[entry['path'] + '@' + entry['sha256']] = str(path.relative_to(ROOT))
    return out


def v7_composition_report():
    """Explicit native-v7 selection: the native realm, its one inherited exact
    edge target in its original hash, and the started native-v7 companion, with
    every companion->native/event reference checked against imports.json."""
    realms = json.loads((ROOT / CERTIFIED / 'resource-realms.json').read_text())
    imports = json.loads((ROOT / CERTIFIED / 'imports.json').read_text())
    require('v7/no_network', imports['network_fallback'] is False and imports['whole_bank_merge'] is False)
    native = realms['native']
    edge = next(e for e in imports['inherited_exact_edges'] if 'native' in e['from_realms'])
    target_realm = realms[edge['to_realm']]
    target = [r for r in target_realm['resources'] if r['retrieval_uri'] == edge['to_retrieval_uri']]
    require('v7/edge_target_unique', len(target) == 1 and target[0]['sha256'] == edge['whole_target_sha256'])
    companion = [r for r in realms['companions']['resources'] if r['retrieval_uri'] == V7_CONSUMER]
    require('v7/companion_unique', len(companion) == 1)
    declared = {(i['from_schema_location'], i['literal_reference']) for i in imports['imports']
                if i['from_realm'] == 'companions' and i['from_whole_sha256'] == companion[0]['sha256']}
    document = json.loads((ROOT / companion[0]['path']).read_text())
    native_uris = {r['retrieval_uri'] for r in native['resources']}
    used = []

    def walk(node, path):
        if type(node) is dict:
            ref = node.get('$ref')
            if type(ref) is str and not ref.startswith('#') and not ref.startswith(V7_CONSUMER):
                used.append(('/' + '/'.join(path) + '/$ref', ref))
            for k, v in node.items():
                walk(v, path + [k.replace('~', '~0').replace('/', '~1')])
        elif type(node) is list:
            for i, v in enumerate(node):
                walk(v, path + [str(i)])
    walk(document, [])
    undeclared = [u for u in used if u not in declared]
    require('v7/undeclared_cross_realm_reference', not undeclared)
    to_native = [u for u in used if u[1].split('#')[0] in native_uris]
    return dict(native=native, edge_target=target[0], companion=companion[0], used=used, to_native=len(to_native),
                declared=len(declared))


def v7_edition():
    if 'v7' not in _EDITIONS:
        report = v7_composition_report()
        resources = list(report['native']['resources']) + [report['edge_target'], report['companion']]
        declaration = dict(network_fallback=False, merge_with_other_realms=False, resources=resources)
        original = OriginalBank(declaration, _content_locations(declaration))
        realms = json.loads((ROOT / CERTIFIED / 'resource-realms.json').read_text())
        goal = OriginalBank(realms['goal'], _content_locations(realms['goal']))
        edition = Edition('native_v7', Bank(original, 'certified_native+edge+started_native_v7_companion'),
                          Bank(goal, 'certified_goal'), custody=V7_CUSTODY, d01=V7_D01,
                          activation='https://puppetmaster.local/proposals/workflow_activation_sources.v4.schema.json',
                          consumer=V7_CONSUMER,
                          goal_arg='https://puppetmaster.local/proposals/workflow_start_goal_argument.v2.schema.json',
                          profile=None)
        origin = skeleton(edition.bank, V7_CUSTODY + '#/$defs/StorageOrigin')
        edition.profile = origin['record']['coordinator_profile']
        edition.composition = dict((k, v) for k, v in report.items() if k in ('to_native', 'declared'))
        edition.composition['used'] = len(report['used'])
        _methods(edition)
        _EDITIONS['v7'] = edition
    return _EDITIONS['v7']
