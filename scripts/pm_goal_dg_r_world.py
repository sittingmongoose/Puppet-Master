#!/usr/bin/env python3
"""DG-R TEST_ONLY world for ``goal_run.cancelled`` (groups R2-R6).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Every original here is a whole outer wrapper that validates against its exact
original schema root in its own isolated realm (``W4Roots``: the predecessor
bank composed with the CV-1136 scoped route and the cancelled projection
reference successor). Each is issued by its registered TEST_ONLY owner, which
writes it as a Storage cell through a real ``TestOwnerStorage`` transaction and
keeps it in private custody. Joins between originals are original
``SourceSelector``/``D05Selector`` values whose ``physical_value_sha256`` is
SHA-256 of the complete outer wrapper's canonical MessagePack bytes (the
Storage cell value), so every consumer resolves a selector against Storage and
recomputes it instead of trusting a presented copy.

Values come from the owners' own execution: the Storage instance, sequence,
times and first receipts come from the test-owner Storage; identities come
from ``uuid4``; every integer goes through ``pm_event_numbers`` and every
timestamp through ``pm_event_datetime`` (via ``pm_goal_test_numrule``).
Schema seeding only supplies opaque filler for members no join reads; every
member a predicate reads is set by the issuing owner.

A world is rebuilt from scratch for each case. A one-defect negative passes a
single knob to the issuing owner, so every dependent copy, selector, digest and
key is recomputed by the owners themselves and only the intended invariant is
broken.
"""
from __future__ import annotations

import base64
import contextlib
import copy
import hashlib
import json
import re
import re._parser as sre_parse
import shutil
import tempfile
import uuid
from pathlib import Path
from urllib.parse import urldefrag, urljoin

import jsonschema
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
from pm_goal_own_c3_w34b_roots import W4Roots
from pm_goal_own_c_oracles import Validator, FORMAT

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
ROOT = NR.ROOT

C = 'https://puppetmaster.local/proposals/goal_run_started_cancelled_consumer.v1.schema.json#/$defs/'
GA = 'https://puppetmaster.local/proposals/goal_run_cancelled_goal_arguments.v1.schema.json#/$defs/'
FA = 'https://puppetmaster.local/proposals/goal_run_cancelled_filesafe_arguments.v1.schema.json#/$defs/'
CA = 'https://puppetmaster.local/proposals/goal_run_cancelled_causal_arguments.v1.schema.json#/$defs/'
PR = 'https://puppetmaster.local/schemas/goal_run_projection_reference/cancelled/1.0.0#/$defs/'
D06 = 'https://puppetmaster.local/proposals/workflow_cancel_positive_safestop.v1.schema.json#/$defs/'
SS = 'https://puppetmaster.local/proposals/executor_safestop_original_start_source.v1.schema.json#/$defs/'
NA = 'https://puppetmaster.local/proposals/native_worknode_current_activation.v1.schema.json#/$defs/'
WO = 'https://puppetmaster.local/proposals/executor_workflow_original_start.v2.schema.json#/$defs/'
WS = 'https://puppetmaster.local/proposals/workflow_start_original_custody.v2.schema.json#/$defs/'
WA = 'https://puppetmaster.local/proposals/workflow_activation_sources.v4.schema.json#/$defs/'
PS = 'https://puppetmaster.local/proposals/executor_process_shutdown_sources.v1.schema.json#/$defs/'
STC = 'https://puppetmaster.local/proposals/goal_run_started_consumer.v1.schema.json#/$defs/'
SEED_TIME = '2026-11-05T09:00:00Z'
GC = 'https://puppetmaster.local/schemas/goal_cancel_command_custody/1.0.0/goal_cancel_command_custody.schema.json#/$defs/'
GB = 'https://puppetmaster.local/schemas/goal_execution_binding_custody/1.0.0/schema.json#/$defs/'
SUBMISSION = 'file:///home/sittingmongoose/PM-Experiments/workflow-cancel-disposition-source-20260913/v3/producer-submission.schema.json'


class Refusal(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code


GUARDS = {}


def guard(code, condition):
    """A product predicate of the DG-R consumers; inventoried for the sweep."""
    GUARDS.setdefault(code, 0)
    if not condition:
        raise Refusal(code)


def code_of(error):
    return getattr(error, 'code', None) or getattr(error, 'reason', None) or type(error).__name__


def sha256(raw):
    return hashlib.sha256(raw).hexdigest()


def physical(value, where='physical'):
    """Complete outer bytes under the owner codec (canonical MessagePack)."""
    return NR.event_value_bytes(value, where)


def physical_sha256(value):
    return sha256(physical(value))


def same(a, b):
    return A.same(a, b)


# ------------------------------------------------------------------ roots

class Roots:
    """Whole isolated realms with the CV-1136 route; one per process."""

    _instance = None

    @classmethod
    def get(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.w4 = W4Roots(eager=True)
        self.registries = dict(self.w4.registries)
        route = self.w4.route
        target, source = route['target_realm'], route['source_realm']
        # The eager W4 audit has already proved that every reference to the
        # exact target URI in the source realm sits at one of the eleven listed
        # locations of the whole source (22 sites under 2 aliases), each with
        # its listed literal. Validation therefore routes exactly that URI:
        # its lookup returns the retained realm's registry, so nested
        # resolution stays in retained_original_d05 (which holds other bytes
        # at a URI also present in the source realm). No bank is merged and
        # no original is rewritten.
        rows = {r['realm']: r for r in self.w4.audit_rows}
        A.require('roots/route_audit', rows[source]['cross_realm_sites'] == 22 and
                  all(r['unresolved'] == 0 for r in rows.values()) and len(self.w4.edges) == 22 and
                  all(e['schema_location'] in self.w4.allowed_sites for e in self.w4.edges))
        self.target_uri, self.target_registry = route['absolute_target_uri'], self.registries[target]
        roots = self

        def routed_ref(validator, ref, instance, schema):
            resolver = validator._resolver
            absolute = urldefrag(urljoin(resolver._base_uri, ref))[0]
            if absolute == roots.target_uri and absolute not in resolver._registry:
                resolved = roots.target_registry.resolver(resolver._base_uri).lookup(ref)
                yield from validator.descend(instance, resolved.contents, resolver=resolved.resolver)
                return
            yield from validator._validate_reference(ref=ref, instance=instance)
        self.validator_class = jsonschema.validators.extend(Validator, {'$ref': routed_ref})
        self._validators = {}

    def validator(self, realm, root):
        key = (realm, root)
        if key not in self._validators:
            self._validators[key] = self.validator_class({'$ref': root}, registry=self.registries[realm],
                                                         format_checker=FORMAT)
        return self._validators[key]

    def errors(self, realm, root, value):
        return sorted(self.validator(realm, root).iter_errors(value), key=lambda e: list(e.absolute_path))

    def validate(self, realm, root, value, code):
        errors = self.errors(realm, root, value)
        if errors:
            error = Refusal(code + '/schema/' + '/'.join(str(p) for p in errors[0].absolute_path))
            error.detail = [e.message[:200] for e in errors[:3]] + [
                '/'.join(map(str, c.absolute_path)) + ': ' + c.message[:160] for e in errors[:2] for c in (e.context or [])[:8]]
            raise error
        return value

    def lookup(self, realm, root):
        return self.registries[realm].resolver().lookup(root)


# ------------------------------------------------------------------ seeding

def sample(pattern):
    """A string matching an anchored regex (subset used by these banks)."""
    def emit(tokens):
        out = []
        for op, arg in tokens:
            name = str(op)
            if name == 'LITERAL':
                out.append(chr(arg))
            elif name == 'NOT_LITERAL':
                out.append('a' if chr(arg) != 'a' else 'b')
            elif name == 'ANY':
                out.append('a')
            elif name == 'IN':
                out.append(pick(arg))
            elif name in ('MAX_REPEAT', 'MIN_REPEAT', 'POSSESSIVE_REPEAT'):
                low, _high, sub = arg
                out.append(emit(sub) * max(low, 0))
            elif name == 'SUBPATTERN':
                out.append(emit(arg[-1]))
            elif name == 'BRANCH':
                out.append(emit(arg[1][0]))
            elif name in ('AT', 'ASSERT', 'ASSERT_NOT'):
                continue
            elif name == 'GROUPREF':
                continue
            else:
                raise ValueError('regex op ' + name)
        return ''.join(out)

    def pick(items):
        negate = any(str(op) == 'NEGATE' for op, _ in items)
        chars = []
        for op, arg in items:
            name = str(op)
            if name == 'LITERAL':
                chars.append(chr(arg))
            elif name == 'RANGE':
                chars.extend(chr(c) for c in range(arg[0], min(arg[1], arg[0] + 30) + 1))
            elif name == 'CATEGORY':
                chars.extend('a0' if 'DIGIT' not in str(arg) else '0')
        if negate:
            return next(c for c in 'aZ0_-' if c not in chars)
        preferred = [c for c in chars if c in 'a0']
        return preferred[0] if preferred else chars[0]
    return emit(sre_parse.parse(pattern))


class Seeder:
    """Schema filler for members no predicate reads. Never an issuer."""

    def __init__(self, roots):
        self.roots = roots

    def seed(self, realm, root, choices=None):
        self.choices = choices or {}
        resolved = self.roots.lookup(realm, root)
        return self._seed([(resolved.contents, resolved.resolver)], '')

    def _layers(self, node, resolver, path):
        if node is True:
            return []
        if '$id' in node:
            resolver = resolver.in_subresource(Resource.from_contents(node, default_specification=DRAFT202012))
        out = [(node, resolver)]
        if '$ref' in node:
            target = resolver.lookup(node['$ref'])
            out += self._layers(target.contents, target.resolver, path)
        for member in node.get('allOf', []):
            out += self._layers(member, resolver, path)
        for keyword in ('anyOf', 'oneOf'):
            if keyword in node:
                variants = node[keyword]
                choice = self.choices.get(path)
                if choice is None:
                    index = next((i for i, v in enumerate(variants) if v.get('type') == 'null'), 0)
                elif callable(choice):
                    index = choice(variants)
                else:
                    index = choice
                out += self._layers(variants[index], resolver, path)
        return out

    def _seed(self, parts, path):
        layers = [l for n, r in parts for l in self._layers(n, r, path)]
        # if/then/else: apply the branch the seeded discriminator selects later
        consts = [n['const'] for n, _ in layers if 'const' in n]
        if consts:
            return copy.deepcopy(consts[-1])
        enums = [n['enum'] for n, _ in layers if 'enum' in n]
        if enums:
            return copy.deepcopy(enums[-1][0])
        types = [n['type'] for n, _ in layers if 'type' in n]
        kind = types[-1] if types else None
        if isinstance(kind, list):
            kind = 'null' if 'null' in kind else kind[0]
        if kind == 'object' or any('properties' in n for n, _ in layers):
            required = list(dict.fromkeys(k for n, _ in layers for k in n.get('required', [])))
            return {k: self._seed([(n['properties'][k], r) for n, r in layers if k in n.get('properties', {})],
                                  path + '/' + k) for k in required}
        if kind == 'null':
            return None
        if kind in ('integer', 'number'):
            return max([0] + [n['minimum'] for n, _ in layers if 'minimum' in n])
        if kind == 'boolean':
            return False
        if kind == 'array':
            length = max([0] + [n['minItems'] for n, _ in layers if 'minItems' in n])
            items = [(n['items'], r) for n, r in layers if 'items' in n]
            return [self._seed(items, path + '/%d' % i) for i in range(length)]
        if kind == 'string':
            formats = [n['format'] for n, _ in layers if 'format' in n]
            if 'date-time' in formats:
                return SEED_TIME
            if 'uuid' in formats:
                return str(uuid.uuid4())
            minimum = max([1] + [n['minLength'] for n, _ in layers if 'minLength' in n])
            patterns = [n['pattern'] for n, _ in layers if 'pattern' in n]
            for candidate in ['x' * minimum] + [sample(p) for p in patterns]:
                if len(candidate) >= minimum and all(re.search(p, candidate) for p in patterns):
                    return candidate
            raise ValueError('no seed for %r at %s' % (patterns, path))
        raise ValueError('unsupported schema at %s' % path)


# ------------------------------------------------------------------ helpers

def get(value, path):
    for key in path.strip('/').split('/') if path.strip('/') else ():
        value = value[int(key)] if isinstance(value, list) else value[key]
    return value


def put(value, path, new):
    keys = path.strip('/').split('/')
    target = get(value, '/'.join(keys[:-1]))
    if isinstance(target, list):
        target[int(keys[-1])] = new
    else:
        target[keys[-1]] = new
    return value


def is_selector(node):
    return isinstance(node, dict) and set(node) == {'storage_instance_id', 'family_id', 'physical_key', 'schema_id',
                                                     'schema_version', 'physical_value_sha256'}


def is_d05_ref(node):
    return isinstance(node, dict) and {'storage_instance_id', 'family_id', 'schema_id', 'schema_version',
                                       'physical_key', 'codec'} <= set(node) and (
        'physical_sha256' in node or 'operation_id' in node) and node.get('codec') == 'messagepack_canonical'


def walk_refs(value, path=''):
    """Every selector-shaped member, in document order."""
    if is_selector(value) or is_d05_ref(value):
        yield path, value
        return
    if isinstance(value, dict):
        for k, v in value.items():
            yield from walk_refs(v, path + '/' + k)
    elif isinstance(value, list):
        for i, v in enumerate(value):
            yield from walk_refs(v, path + '/%d' % i)


class Clock:
    """World clock: strictly increasing milliseconds, formatted by Storage."""

    def __init__(self, storage):
        self.storage = storage
        self.ms = storage.clock_last_ms

    def now(self):
        self.ms = NR.uint64(max(self.ms + 1, self.storage.clock_last_ms + 1), 'clock/now')
        text = S.format_ms(self.ms)
        NR.storage_time(text, 'clock/storage_time')
        return text


# ------------------------------------------------------------------ Stored originals

class Stored:
    """Owner-held record of one issued outer wrapper and its Storage cell."""

    __slots__ = ("family", "key", "wrapper", "sha256", "tx_id", "owner_id", "handle", "root", "realm", "sid")

    def __init__(self, family, key, wrapper, tx_id, owner_id, handle, root, realm, sid):
        self.family, self.key, self.wrapper, self.sid = family, key, wrapper, sid
        self.sha256 = physical_sha256(wrapper)
        self.tx_id, self.owner_id, self.handle, self.root, self.realm = tx_id, owner_id, handle, root, realm

    def selector(self):
        return dict(storage_instance_id=self.sid, family_id=self.family, physical_key=self.key,
                    schema_id=self.wrapper['schema_id'], schema_version=self.wrapper['schema_version'],
                    physical_value_sha256=self.sha256)

    def d05(self):
        return dict(storage_instance_id=self.sid, family_id=self.family, schema_id=self.wrapper['schema_id'],
                    schema_version=self.wrapper['schema_version'], physical_key=self.key,
                    physical_sha256=self.sha256, codec='messagepack_canonical')


# ------------------------------------------------------------------ owners

class PhysOwner(A.TestOwner):
    """TEST_ONLY owner of one or more original Storage families.

    ``issue_physical`` seeds filler, binds the world's scope, Storage instance,
    clock and fresh identities, applies the owner's semantic overlay, issues
    every still-unfilled selector's target as an ancillary original, validates
    the whole wrapper against its exact original root and writes it as a
    Storage cell in one transaction (CAS from absent, or from the exact prior
    version for a mutable key). Every version stays in private custody, so a
    historical selector at a mutable key resolves through immutable custody.
    """

    role = 'physical'

    def __init__(self, world, role):
        self.role = role
        super().__init__(world.registry, owner_id='TEST_ONLY:owner:%s:%s' % (role, uuid.uuid4()))
        self.world = world
        self.by_sha = {}
        self.history = {}
        self.current = {}

    def key(self, family, *parts):
        """TEST_ONLY source-family key: K(storage) plus a scope/discriminator digest.

        Source families keep their own original key recipes natively; these
        test keys only need to be unique and independent of identifier length.
        The projection and checkpoint keys use the exact SP-312 K recipe.
        """
        w = self.world
        digest = sha256(NR.binding_value_bytes([family, w.scope['project_id'], w.scope['goal_run_id']] +
                                               [str(p) for p in parts], 'key/digest'))
        return ':'.join([family, S.k_component(w.sid), digest])

    def build_wrapper(self, family, realm, root, key, overlay=(), choices=None, knob=None):
        """Seed, bind, overlay, ancillary-fill and validate one outer wrapper (no write)."""
        w = self.world
        wrapper = w.seeder.seed(realm, root, choices) if root is not None else dict(
            schema_id='pm.storage_value.test_only_ancillary.v1', schema_version='1.0.0', record={})
        w.bind(wrapper)
        if 'physical_key' in wrapper:
            wrapper['physical_key'] = key
        for path, value in overlay:
            put(wrapper, path, copy.deepcopy(value))
        if knob is not None:
            knob(wrapper)
        w.autofill(wrapper, family)
        if root is not None:
            w.repair_filler(realm, root, wrapper, {p for p, _ in overlay})
            w.roots.validate(realm, root, wrapper, 'issue/' + family)
        return wrapper

    def write_wrapper(self, family, realm, root, key, wrapper, mutable=False, reservation=None):
        """Write one validated wrapper as a Storage cell and keep it in custody."""
        w = self.world
        with self.recorder.call(self.owner_id, 'issue:' + family, dict(family=family, key=key)) as slot:
            prior = self.current.get((family, key))
            A.require('issue/immutable_key', prior is None or mutable)
            if reservation is not None:
                tx = w.storage.publish_terminal(reservation, family, key, wrapper)
            else:
                tx = w.storage.transact([dict(table=family, key=key, expected=None if prior is None else prior[1],
                                              value=wrapper)])
            version = w.storage.cell(family, key)['version']
            handle = self._issue(root, wrapper, kind=family)
            stored = Stored(family, key, wrapper, tx['tx_id'], self.owner_id, handle, root, realm, w.sid)
            self.by_sha[stored.sha256] = stored
            self.history[(family, key, stored.sha256)] = stored
            self.current[(family, key)] = (stored, version)
            w.issued[(family, key, stored.sha256)] = stored
            slot.set(dict(family=family, sha256=stored.sha256, tx_id=tx['tx_id']))
            return stored

    def issue_physical(self, family, realm, root, key, overlay=(), choices=None, mutable=False, knob=None):
        wrapper = self.build_wrapper(family, realm, root, key, overlay, choices, knob)
        return self.write_wrapper(family, realm, root, key, wrapper, mutable=mutable)

    def retained(self, family, key, sha):
        """Immutable custody lookup by exact commitment (never by caller value)."""
        stored = self.history.get((family, key, sha))
        if stored is None:
            return None
        self._ref(stored.handle)
        return stored

    def observe(self):
        return dict(super().observe(), cells=len(self.current))


class NativeOwner(PhysOwner):
    """Native WorkNode run body/control owner (current-state CAS)."""

    def __init__(self, world):
        super().__init__(world, 'native_run')
        self.revision = None
        self.status = None

    def body(self, revision, status, activation, knob=None):
        w = self.world
        overlay = [('/record/revision', revision), ('/record/status', status),
                   ('/record/activation_state', dict(activation_id=w.ids['activation_id'], state=activation,
                                                     revision=w.activation_revision, goal_run_id=w.scope['goal_run_id'],
                                                     workgraph_ref=w.ids['workgraph_ref'],
                                                     idempotency_key=w.ids['activation_key'])),
                   ('/record/execution_owner_ref', w.ids['execution_owner_ref']),
                   ('/record/execution_owner_epoch', 1),
                   ('/record/identity', w.run_identity())]
        if self.revision is not None:
            A.require('native/cas_revision', revision == self.revision + 1)
        stored = self.issue_physical('workflow_goal_run_body', 'native_consumer', WA + 'GoalRunBodyPhysical',
                                     self.key('workflow_goal_run_body'), overlay, mutable=True, knob=knob)
        self.revision, self.status = revision, status
        return stored

    def prepare_body(self, prior, status, knob=None):
        """Candidate successor body: every member of the prior body is preserved
        except revision (+1) and status; activation is unchanged."""
        wrapper = copy.deepcopy(prior.wrapper)
        wrapper['record']['revision'] = NR.uint64(prior.wrapper['record']['revision'] + 1, 'native/revision')
        wrapper['record']['status'] = status
        if knob is not None:
            knob(wrapper)
        self.world.roots.validate('native_consumer', WA + 'GoalRunBodyPhysical', wrapper, 'issue/native_candidate')
        return wrapper

    def prepare_control(self, prior, body_wrapper, knob=None):
        wrapper = copy.deepcopy(prior.wrapper)
        wrapper['record']['revision'] = NR.uint64(prior.wrapper['record']['revision'] + 1, 'native/control_revision')
        wrapper['record']['body_record_sha256'] = physical_sha256(body_wrapper['record'])
        wrapper['record']['pending_operation_id'] = None
        if knob is not None:
            knob(wrapper)
        self.world.roots.validate('native_consumer', WA + 'GoalRunControlPhysical', wrapper, 'issue/native_candidate')
        return wrapper

    def commit(self, body_wrapper, control_wrapper, prior_body, prior_control):
        """Native CAS: the stored body/control must still be the prior versions."""
        A.require('native/cas_body', self.current[(prior_body.family, prior_body.key)][0] is prior_body)
        A.require('native/cas_control', self.current[(prior_control.family, prior_control.key)][0] is prior_control)
        body = self.write_wrapper(prior_body.family, 'native_consumer', WA + 'GoalRunBodyPhysical', prior_body.key,
                                  body_wrapper, mutable=True)
        control = self.write_wrapper(prior_control.family, 'native_consumer', WA + 'GoalRunControlPhysical',
                                     prior_control.key, control_wrapper, mutable=True)
        self.revision, self.status = body_wrapper['record']['revision'], body_wrapper['record']['status']
        return body, control

    def control(self, revision, body, pending=None, knob=None):
        w = self.world
        overlay = [('/record/revision', revision), ('/record/body_record_sha256', physical_sha256(body.wrapper['record'])),
                   ('/record/execution_owner_epoch', 1), ('/record/pending_operation_id', pending),
                   ('/record/identity', w.run_identity())]
        return self.issue_physical('workflow_goal_run_control', 'native_consumer', WA + 'GoalRunControlPhysical',
                                   self.key('workflow_goal_run_control'), overlay, mutable=True, knob=knob)


class World:
    """One complete TEST_ONLY world for one goal_run.cancelled case."""

    def __init__(self, cfg=None, base=None):
        self.cfg = dict(cfg or {})
        self.knobs = self.cfg.get('knobs', {})
        World.CURRENT = self  # lets a one-defect knob draw on genuine originals of this world
        self.tmp = Path(tempfile.mkdtemp(prefix='dgr-world-', dir=base))
        self.storage = S.TestOwnerStorage.create(self.tmp / 'storage', segment_target_bytes=int(
            self.cfg.get('segment_target_bytes', 65536)))
        self.registry = A.OwnerRegistry()
        self.recorder = self.registry.recorder
        self.roots = Roots.get()
        self.seeder = Seeder(self.roots)
        self.clock = Clock(self.storage)
        self.sid = self.storage.storage_instance_id
        tag = uuid.uuid4().hex[:12]
        pad = '-' + 'p' * int(self.cfg.get('id_pad', 0)) if self.cfg.get('id_pad') else ''
        self.scope = dict(storage_instance_id=self.sid, project_id='TEST_ONLY-project-' + tag + pad,
                          goal_id='TEST_ONLY-goal-' + tag + pad, goal_run_id='TEST_ONLY-goal-run-' + tag + pad)
        self.ids = dict(execution_owner_ref='TEST_ONLY:executor-owner:' + tag,
                        workflow_owner_ref='TEST_ONLY:workflow-owner:' + tag,
                        plan_compile_run_id='TEST_ONLY-compile-' + tag, workgraph_id='TEST_ONLY-workgraph-' + tag,
                        workgraph_ref='TEST_ONLY:workgraph-ref:' + tag, activation_id='TEST_ONLY:activation:' + tag,
                        activation_key='TEST_ONLY:activation-key:' + tag)
        self.workgraph_sha256 = sha256(('TEST_ONLY:workgraph:' + tag).encode())
        self.activation_revision = 1
        self.issued = {}
        self.append = A.AppendOwner(self.registry, self.storage)
        self.ancillary = PhysOwner(self, 'ancillary_provenance')
        # TEST_ONLY disclosure-permission owner state (read / project grants)
        self.permissions = dict(read=True, project=True)

    def knob(self, name):
        return self.knobs.get(name)

    def kval(self, name, default):
        """A value knob: a world-aware callable, a literal, or the default."""
        value = self.knobs.get(name)
        if value is None:
            return default
        return value(self) if callable(value) else value

    def close(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def run_identity(self):
        return dict(project_id=self.scope['project_id'], goal_id=self.scope['goal_id'],
                    goal_run_id=self.scope['goal_run_id'], plan_compile_run_id=self.ids['plan_compile_run_id'],
                    workgraph_id=self.ids['workgraph_id'], workgraph_revision=1, workgraph_ref=self.ids['workgraph_ref'],
                    workgraph_sha256=self.workgraph_sha256)

    def bind(self, node):
        if is_selector(node) or is_d05_ref(node):
            return
        if isinstance(node, dict):
            for k, v in list(node.items()):
                if k == 'storage_instance_id' and v == 'x':
                    node[k] = self.sid
                elif k in ('project_id', 'goal_id', 'goal_run_id') and v == 'x':
                    node[k] = self.scope[k]
                elif v == SEED_TIME:
                    node[k] = self.clock.now()
                elif v == 'x' and (k.endswith('_id') or k.endswith('_ref')):
                    node[k] = 'TEST_ONLY:%s:%s' % (k, uuid.uuid4().hex[:16])
                else:
                    self.bind(v)
        elif isinstance(node, list):
            for i, v in enumerate(node):
                if v == SEED_TIME:
                    node[i] = self.clock.now()
                else:
                    self.bind(v)

    def repair_filler(self, realm, root, wrapper, owned, allow_const=False):
        """Filler that chose a null alternative where a sibling rule needs a string.

        Only members the owner did not set are touched, and only from null to
        an opaque TEST_ONLY string; a member any predicate reads is owner-set.
        """
        for _ in range(40):
            errors = self.roots.errors(realm, root, wrapper)
            flat = []
            for e in errors:
                flat.append(e)
                flat.extend(c for c in (e.context or []) if c.absolute_path)
            unowned = [e for e in flat if e.absolute_path and
                       not any(('/' + '/'.join(map(str, e.absolute_path))).startswith(o) for o in owned)]
            fixable = [e for e in unowned if e.instance is None and e.validator == 'type' and
                       e.validator_value in ('string', ['string'])]
            consts = [e for e in unowned if e.validator == 'const' and allow_const]
            if not fixable and not consts:
                return
            for e in fixable:
                put(wrapper, '/' + '/'.join(map(str, e.absolute_path)), 'TEST_ONLY:%s:%s' % (
                    e.absolute_path[-1], uuid.uuid4().hex[:12]))
            for e in consts[:1]:
                put(wrapper, '/' + '/'.join(map(str, e.absolute_path)), copy.deepcopy(e.validator_value))

    def autofill(self, wrapper, family):
        """Issue an ancillary provenance original for every unfilled selector."""
        for path, ref in list(walk_refs(wrapper)):
            if ref.get('physical_key') != 'x':
                continue
            schema_id = ref['schema_id'] if ref['schema_id'] != 'x' else 'pm.storage_value.test_only_ancillary.v1'
            version = ref['schema_version'] if ref['schema_version'] != 'x' else '1.0.0'
            fam = ref['family_id'] if ref['family_id'] != 'x' else 'test_only_ancillary'
            body = dict(schema_id=schema_id, schema_version=version,
                        record=dict(qualification=QUALIFICATION, provenance_of=family + path,
                                    operation_id=ref.get('operation_id') if ref.get('operation_id') != 'x' else
                                    'TEST_ONLY:op:' + uuid.uuid4().hex[:16]))
            key = self.ancillary.key(fam, uuid.uuid4().hex)
            stored = self.ancillary.issue_physical(fam, None, None, key, [('/schema_id', schema_id),
                                                                          ('/schema_version', version),
                                                                          ('/record', body['record'])])
            filled = stored.selector() if is_selector(ref) else dict(stored.d05(), **(
                {'operation_id': stored.wrapper['record']['operation_id']} if 'operation_id' in ref else {}))
            if 'physical_sha256' not in ref:
                filled.pop('physical_sha256', None)
            put(wrapper, path, {k: filled[k] for k in ref})

    def resolve(self, ref, family=None):
        """Resolve a selector: the Storage cell, else the family owner's immutable custody."""
        guard('select/shape', is_selector(ref) or is_d05_ref(ref))
        guard('select/storage_instance', ref['storage_instance_id'] == self.sid)
        if family is not None:
            guard('select/family', ref['family_id'] == family)
        commitment = ref.get('physical_value_sha256', ref.get('physical_sha256'))
        cell = self.storage.cell(ref['family_id'], ref['physical_key'])
        if commitment is None:
            # Origin reference: the immutable origin cell, matched by operation.
            guard('select/origin_absent', cell is not None)
            value = cell['value']
            inner = value.get('value', value.get('record', {}))
            guard('select/origin_operation', inner.get('operation_id') == ref['operation_id'])
        else:
            stored = self.issued.get((ref['family_id'], ref['physical_key'], commitment))
            guard('select/commitment', stored is not None)
            owner = next(o for o in self.registry._owners.values() if o.owner_id == stored.owner_id)
            guard('select/custody', owner.retained(stored.family, stored.key, commitment) is stored)
            # The Storage cell must be exactly the owner's latest issuance at
            # that key; a historical version resolves only through custody.
            latest = owner.current.get((stored.family, stored.key))
            guard('select/cell_substituted', cell is not None and latest is not None and
                  physical_sha256(cell['value']) == latest[0].sha256)
            value = stored.wrapper
        guard('select/schema', value.get('schema_id') == ref['schema_id'] and
              value.get('schema_version') == ref['schema_version'])
        return copy.deepcopy(value)


SEL = lambda stored: stored.selector()  # noqa: E731


def body_commitment(world, body, control):
    """BodyIssuanceCommitment for a native body/control pair (D01 transition)."""
    record = body.wrapper['record']
    return dict(kind='historical_native_issuance_commitment', body=body.selector(), control=control.selector(),
                identity=world.run_identity(),
                body_revision=record['revision'], activation_revision=record['activation_state']['revision'],
                status=record['status'], activation_state=record['activation_state']['state'],
                workflow_owner_ref=world.ids['workflow_owner_ref'], workflow_owner_epoch=1)


class CancelWorld(World):
    """Executes the modeled original issuance for one cancellation case.

    cfg keys: ``start`` ('started' | 'no_start'), ``effects`` ('none' |
    'mutation'), ``terminal`` (False | True for already-terminal byte
    preservation), ``knobs`` (one-defect injections by name).
    """

    def build(self):
        cfg = self.cfg
        self.native = NativeOwner(self)
        self.d01 = PhysOwner(self, 'd01_workflow_source')
        self.start = PhysOwner(self, 'workflow_start')
        self.goal = PhysOwner(self, 'goal_cancel')
        self.scheduler = PhysOwner(self, 'scheduler')
        self.d05 = PhysOwner(self, 'd05_safe_stop')
        self.filesafe = PhysOwner(self, 'filesafe')
        self.process = PhysOwner(self, 'process')
        self.d06 = PhysOwner(self, 'd06_cancel')
        self.out = {}
        if self.knob('pre_start_events'):
            self.knob('pre_start_events')(self)
        self._birth()
        if cfg.get('start', 'started') == 'started':
            self._start()
        else:
            self._no_start()
        self._goal_cancel()
        self._scheduler_stop()
        self._effects()
        self._safe_stop()
        self._d06()
        return self

    # -- native birth and D01 ---------------------------------------------------
    def _d01_update(self, op, rule, cause, before, after, result, origin_sel, prior_head, writer_method, revision):
        w = self
        update = w.d01.issue_physical(
            'executor_workflow_workflow_update', 'native_consumer', WO + 'StorageWorkflowUpdate',
            w.d01.key('executor_workflow_workflow_update', revision),
            [('/record/operation_id', op), ('/record/revision', revision),
             ('/record/previous_head', None if prior_head is None else prior_head.selector()),
             ('/record/before_body', None if before is None else before[0].selector()),
             ('/record/before_control', None if before is None else before[1].selector()),
             ('/record/after_body', after[0].selector()), ('/record/after_control', after[1].selector()),
             ('/record/cause', cause), ('/record/original_owner_result', result.selector()),
             ('/record/original_owner_origin', origin_sel),
             ('/record/transition', dict(rule=rule, before=None if before is None else body_commitment(w, *before),
                                         after=body_commitment(w, *after), original_writer_method=writer_method,
                                         original_owner_result=result.selector(), original_owner_origin=origin_sel))],
            knob=w.knob('d01_update:' + rule))
        return update

    def _d01_head(self, revision, update, prior_head, activation_body, activation_origin):
        return self.d01.issue_physical(
            'executor_workflow_workflow_head', 'native_consumer', WO + 'StorageWorkflowHead',
            self.d01.key('executor_workflow_workflow_head'),
            [('/record/revision', revision), ('/record/activation_body', activation_body.selector()),
             ('/record/activation_origin', activation_origin.selector()),
             ('/record/current_body', update.wrapper['record']['after_body']),
             ('/record/current_control', update.wrapper['record']['after_control']),
             ('/record/previous_head', None if prior_head is None else prior_head.selector()),
             ('/record/last_update', update.selector()), ('/record/workflow_owner_ref', self.ids['workflow_owner_ref']),
             ('/record/workflow_owner_epoch', 1), ('/record/pending_operation_id', None)],
            mutable=True, knob=self.knob('d01_head:%d' % revision))

    def _d01_origin(self, method, op, causation, update, head, choices=None):
        return self.d01.issue_physical(
            'executor_workflow_mutation_origin', 'native_consumer', WO + 'StorageWorkflowMutationOrigin',
            self.d01.key('executor_workflow_mutation_origin', op),
            [('/record/method', method), ('/record/operation_id', op), ('/record/causation', causation),
             ('/record/afterimages/workflow_update', update.selector()), ('/record/afterimages/workflow_head',
                                                                            head.selector())],
            choices=choices or {'/record/afterimages': 1}, knob=self.knob('d01_origin:' + method))

    def _birth(self):
        w = self
        w.body0 = w.native.body(1, 'ready', 'activation_pending')
        w.control0 = w.native.control(1, w.body0)
        w.ops = dict(birth='TEST_ONLY:op:birth:' + uuid.uuid4().hex[:12])

    def _start(self):
        w = self
        op = 'TEST_ONLY:op:start:' + uuid.uuid4().hex[:12]
        w.ops['start'] = op
        origin0 = w.start.issue_physical('workflow_original_source_origin', 'native_consumer', WA + 'OwnerIssueOriginPhysical',
                                         w.start.key('workflow_original_source_origin', 'initial'),
                                         [('/record/original_operation_id', w.ops['birth'])])
        control0 = w.start.issue_physical('workflow_start_control', 'native_consumer', WS + 'StorageControl',
                                          w.start.key('workflow_start_control'),
                                          [('/record/epoch', 0), ('/record/pending_candidate', None),
                                           ('/record/committed_start', None), ('/record/original_operation_id', None)],
                                          mutable=True)
        candidate = w.start.issue_physical('workflow_start_candidate', 'native_consumer', WS + 'StorageCandidate',
                                           w.start.key('workflow_start_candidate', op), [])
        w.start_cause_candidate = candidate
        w.body1 = w.native.body(2, 'running', 'active')
        w.control1 = w.native.control(2, w.body1)
        # The original Start publishes goal_run.started v3 through Storage as a
        # first barrier; the commit records Storage's own first receipt.
        started = w._started_event(op)
        events, _, _ = w.append.append_original('TEST_ONLY:append:' + op, dict(op=op, kind='start'), [started],
                                                durability_class='barrier')
        start_custody = w.append.first_receipt(events[0])
        w.started_event = events[0]
        w.start_custody = start_custody
        commit = w.start.issue_physical('workflow_start_commit', 'native_consumer', WS + 'StorageCommit',
                                        w.start.key('workflow_start_commit', op),
                                        [('/record/operation_id', op), ('/record/candidate', candidate.selector()),
                                         ('/record/before_body', w.body0.selector()),
                                         ('/record/before_control', w.control0.selector()),
                                         ('/record/after_body', w.body1.selector()),
                                         ('/record/after_control', w.control1.selector()),
                                         ('/record/event_id', start_custody['event_id']),
                                         ('/record/event_type', 'goal_run.started'),
                                         ('/record/event_value_commitment',
                                          copy.deepcopy(start_custody['original_event_value_commitment'])),
                                         ('/record/first_append_receipt',
                                          copy.deepcopy(start_custody['first_append_receipt']))],
                                        knob=w.knob('start_commit'))
        s_origin = w.start.issue_physical('workflow_start_origin', 'native_consumer', WS + 'StorageOrigin',
                                          w.start.key('workflow_start_origin', op), [])
        after = (w.body0, w.control0) if w.knob('start_after_birth') else (w.body1, w.control1)
        update = w._d01_update(op, 'original_workflow_start', 'owner_status', (w.body0, w.control0), after,
                               commit, s_origin.selector(), None, 'owner.workflow.start.commit.v2', 1)
        head = w._d01_head(1, update, None, w.body1, origin0)
        d01_origin = w._d01_origin('owner.executor.workflow_source.update_workflow.v3', 'TEST_ONLY:op:d01:' + op[-12:],
                                   commit.selector(), update, head)
        w.start_cause = dict(kind='original_started', control=control0, initial_control_origin=origin0,
                             candidate=candidate, commit=commit, origin=s_origin, original_d01_update=update,
                             original_d01_origin=d01_origin, original_d01_head=head)
        w.head = head
        w.activation_origin = origin0

    def _no_start(self):
        w = self
        origin0 = w.start.issue_physical('workflow_original_source_origin', 'native_consumer', WA + 'OwnerIssueOriginPhysical',
                                         w.start.key('workflow_original_source_origin', 'initial'),
                                         [('/record/original_operation_id', w.ops['birth'])])
        control0 = w.start.issue_physical('workflow_start_control', 'native_consumer', WS + 'StorageControl',
                                          w.start.key('workflow_start_control'),
                                          [('/record/epoch', 0), ('/record/pending_candidate', None),
                                           ('/record/committed_start', None), ('/record/original_operation_id', None)],
                                          mutable=True, knob=w.knob('no_start_control'))
        birth = w.d01.issue_physical('executor_workflow_workflow_birth', 'native_consumer', WO + 'StorageWorkflowBirth',
                                     w.d01.key('executor_workflow_workflow_birth'),
                                     [('/record/operation_id', w.ops['birth']),
                                      ('/record/activation_body', w.body0.selector()),
                                      ('/record/activation_control', w.control0.selector()),
                                      ('/record/activation_origin', origin0.selector()),
                                      ('/record/birth_issuance', body_commitment(w, w.body0, w.control0))],
                                     knob=w.knob('no_start_birth'))
        head = w.d01.issue_physical('executor_workflow_workflow_head', 'native_consumer', WO + 'StorageWorkflowHead',
                                    w.d01.key('executor_workflow_workflow_head'),
                                    [('/record/revision', 1), ('/record/activation_body', w.body0.selector()),
                                     ('/record/activation_origin', origin0.selector()),
                                     ('/record/current_body', w.body0.selector()),
                                     ('/record/current_control', w.control0.selector()), ('/record/previous_head', None),
                                     ('/record/workflow_owner_ref', w.ids['workflow_owner_ref']),
                                     ('/record/workflow_owner_epoch', 1), ('/record/pending_operation_id', None)],
                                    mutable=True)
        birth_origin = w.d01.issue_physical(
            'executor_workflow_mutation_origin', 'native_consumer', WO + 'StorageWorkflowMutationOrigin',
            w.d01.key('executor_workflow_mutation_origin', w.ops['birth']),
            [('/record/method', 'owner.executor.workflow_source.enroll_workflow_birth.v3'),
             ('/record/operation_id', w.ops['birth']),
             ('/record/afterimages/workflow_birth', (w._other_birth(origin0) if w.knob('no_start_birth_origin_other')
                                                     else birth).selector()),
             ('/record/afterimages/workflow_head', head.selector())],
            choices={'/record/afterimages': 0}, knob=w.knob('no_start_birth_origin'))
        w.body1, w.control1 = w.body0, w.control0
        w.start_cause = dict(kind='original_initialized_no_start', control=control0, initial_control_origin=origin0,
                             original_workflow_birth=birth, original_workflow_birth_origin=birth_origin)
        w.head = head
        w.activation_origin = origin0

    # -- Goal cancellation, Stop, SourceAudit and binding ---------------------------
    def _goal_cancel(self):
        w, g = self, self.goal
        GC = 'https://puppetmaster.local/schemas/goal_cancel_command_custody/1.0.0/goal_cancel_command_custody.schema.json#/$defs/'
        GB = 'https://puppetmaster.local/schemas/goal_execution_binding_custody/1.0.0/schema.json#/$defs/'
        op = 'TEST_ONLY:op:goal-cancel:' + uuid.uuid4().hex[:12]
        w.ops['goal_cancel'] = op
        thread = 'TEST_ONLY-thread-' + uuid.uuid4().hex[:8]
        audit = g.issue_physical('goal_cancel_source_audit', 'goal_consumer', GC + 'StorageSourceAudit',
                                 g.key('goal_cancel_source_audit', op),
                                 [('/record/thread_id', thread)], choices=w._non_null_choices('goal_consumer', GC + 'StorageSourceAudit'),
                                 knob=w.knob('goal_source_audit'))
        intent = g.issue_physical('goal_cancel_stop_intent', 'goal_consumer', GC + 'StopIntent',
                                  g.key('goal_cancel_stop_intent', op),
                                  [('/operation_id', op), ('/thread_id', thread), ('/source_audit_sha256', audit.sha256),
                                   ('/before_user_stop_epoch', 0), ('/after_user_stop_epoch', 1)],
                                  knob=w.knob('goal_stop_intent'))
        receipt = g.issue_physical('goal_cancel_stop_receipt', 'goal_consumer', GC + 'StorageStopReceipt',
                                   g.key('goal_cancel_stop_receipt', op),
                                   [('/record/operation_id', op), ('/record/thread_id', thread),
                                    ('/record/stop_intent_sha256', intent.sha256),
                                    ('/record/source_audit_sha256', audit.sha256), ('/record/before_user_stop_epoch', 0),
                                    ('/record/after_user_stop_epoch', 1), ('/record/latched', True)],
                                   knob=w.knob('goal_stop_receipt'))
        # The Goal-level cancellation Event is genuinely appended by Storage;
        # the control publication carries Storage's own first receipt.
        goal_event = w._goal_event(op)
        events, reservation, _ = w.append.append_original('TEST_ONLY:append:' + op, dict(op=op), [goal_event],
                                                          durability_class='barrier')
        custody = w.append.first_receipt(events[0])
        publication = dict(event_id=custody['event_id'], first_append_receipt=custody['first_append_receipt'],
                           original_append_result=dict(event_id=custody['event_id'],
                                                       sequence_id=custody['first_append_receipt']['sequence_id'],
                                                       byte_offset=custody['first_append_receipt']['byte_offset'],
                                                       segment_ref=custody['original_segment_ref']),
                           original_event_value_commitment=copy.deepcopy(custody['original_event_value_commitment']))
        control = g.issue_physical('goal_cancel_control_publication', 'goal_consumer', GC + 'StorageControlPublication',
                                   g.key('goal_cancel_control_publication', op),
                                   [('/record/operation_id', op), ('/record/thread_id', thread),
                                    ('/record/source_audit_sha256', audit.sha256),
                                    ('/record/cancellation_receipt_sha256', receipt.sha256),
                                    ('/record/original_publication', publication)],
                                   choices=w._non_null_choices('goal_consumer', GC + 'StorageControlPublication'),
                                   knob=w.knob('goal_control_publication'))
        revision = g.issue_physical('goal_execution_binding_revision', 'goal_consumer', GB + 'StorageBindingRevision',
                                    g.key('goal_execution_binding_revision', 1),
                                    [('/record/scope/thread_id', thread), ('/record/binding_revision', 1)],
                                    knob=w.knob('goal_binding_revision'))
        origin = g.issue_physical('goal_execution_binding_origin', 'goal_consumer', GB + 'StorageBindingOrigin',
                                  g.key('goal_execution_binding_origin', 1),
                                  [('/record/scope/thread_id', thread), ('/record/binding_revision', 1),
                                   ('/record/issued_revision_key', revision.key),
                                   ('/record/issued_revision_sha256', revision.sha256)],
                                  knob=w.knob('goal_binding_origin'))

        def physical_selection(stored):
            return dict(family_id=stored.family, physical_key=stored.key, schema_id=stored.wrapper['schema_id'],
                        schema_version=stored.wrapper['schema_version'], codec_id='messagepack_canonical',
                        complete_value_sha256=stored.sha256)
        selection = g.issue_physical('goal_cancel_binding_selection', 'goal_consumer', GB + 'StorageBindingSelection',
                                     g.key('goal_cancel_binding_selection', op),
                                     [('/record/scope/thread_id', thread), ('/record/operation_id', op),
                                      ('/record/binding_revision', physical_selection(revision)),
                                      ('/record/binding_origin', physical_selection(origin))],
                                     choices=w._non_null_choices('goal_consumer', GB + 'StorageBindingSelection'),
                                     knob=w.knob('goal_binding_selection'))
        w.goal_cause = dict(original_source_audit=audit, original_stop_intent=intent, original_stop_receipt=receipt,
                            original_control_publication=control, original_binding_selection=selection,
                            original_binding_revision=revision, original_binding_origin=origin)
        w.goal_event = events[0]
        w.goal_revision = 3

    def _non_null_choices(self, realm, root):
        """Prefer a non-null alternative wherever a member admits null or a value."""
        return _NonNull()

    def _started_event(self, op):
        """goal_run.started v3 envelope: whole TypedOriginalEvent filler, owner-set identity."""
        w = self
        event = w.seeder.seed('native_consumer', WS + 'TypedOriginalEvent')
        w.bind(event)
        occurred = w.clock.now()
        NR.event_time(occurred, 'start/occurred_at_utc')
        for k in list(event):
            if k in ('observed_at_utc', 'persisted_at_utc', 'sequence_id'):
                del event[k]
        event.update(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project', event_id=str(uuid.uuid4()),
                     event_type='goal_run.started', project_id=w.scope['project_id'], occurred_at_utc=occurred,
                     idempotency_key='TEST_ONLY:goal_run.started:' + op, payload_ref=None,
                     redaction_profile='no_secrets', replay_policy='dedupe_by_idempotency_key',
                     correlation_id='TEST_ONLY:correlation:' + op)
        payload = event['payload']
        for k, v in (('goal_run_id', w.scope['goal_run_id']), ('goal_id', w.scope['goal_id']),
                     ('project_id', w.scope['project_id'])):
            if k in payload:
                payload[k] = v
            if isinstance(payload.get('payload'), dict) and k in payload['payload']:
                payload['payload'][k] = v
        if 'idempotency_key' in payload:
            payload['idempotency_key'] = event['idempotency_key']
        if 'occurred_at_utc' in payload:
            payload['occurred_at_utc'] = occurred
        return event

    def _goal_event(self, op):
        w = self
        occurred = w.clock.now()
        return dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project', event_id=str(uuid.uuid4()),
                    event_type='goal.cancelled', project_id=w.scope['project_id'], thread_id=None, run_id=None,
                    node_id=None, attempt_id=None, actor_ref='TEST_ONLY:actor:user', requested_account_ref=None,
                    effective_account_ref=None, occurred_at_utc=occurred, producer_sequence_id=None,
                    correlation_id='TEST_ONLY:correlation:' + op, causation_event_id=None, parent_event_id=None,
                    idempotency_key='TEST_ONLY:goal.cancelled:' + op,
                    payload_schema_id='pm.goal_runtime_event.goal_cancelled.schema.v1',
                    payload=dict(goal_id=w.scope['goal_id'], operation_id=op), payload_ref=None,
                    redaction_profile='no_secrets', replay_policy='dedupe_by_idempotency_key',
                    migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None,
                                   compatibility_event_type=None))


    # -- SchedulerStop, native cancellation result and inventory ------------------
    def _scheduler_stop(self):
        w, sc = self, self.scheduler
        op_native = 'TEST_ONLY:op:native-cancel:' + uuid.uuid4().hex[:12]
        op_stop = 'TEST_ONLY:op:scheduler-stop:' + uuid.uuid4().hex[:12]
        w.ops.update(native_cancel=op_native, scheduler_stop=op_stop)
        run_control = sc.issue_physical('executor_run_execution_control', 'native_consumer', NA + 'StorageRunExecutionControl',
                                        sc.key('executor_run_execution_control'), [], mutable=True)
        result = sc.issue_physical('executor_run_operation_result', 'native_consumer', NA + 'StorageRunOperationResult',
                                   sc.key('executor_run_operation_result', op_native),
                                   [('/record/operation_id', op_native), ('/record/operation', 'cancel'),
                                    ('/record/after_control', run_control.selector())],
                                   knob=w.knob('native_cancel_result'))
        origin = sc.issue_physical('executor_original_publication_origin', 'native_consumer', NA + 'StoragePublicationOrigin',
                                   sc.key('executor_original_publication_origin', op_native),
                                   [('/record/issuer_method', 'owner.executor.native.record_cancellation.v1'),
                                    ('/record/original_operation_id', op_native), ('/record/issued_key', result.key),
                                    ('/record/issued_record_sha256', physical_sha256(result.wrapper['record']))],
                                   knob=w.knob('native_cancel_origin'))
        coverage = sc.issue_physical('executor_workflow_coverage_birth', 'native_consumer', WO + 'StorageCoverageBirth',
                                     sc.key('executor_workflow_coverage_birth'),
                                     [('/record/workflow_head_at_materialization', w.head.selector())])
        inventory = sc.issue_physical('executor_workflow_inventory_head', 'native_consumer', WO + 'StorageInventoryHead',
                                      sc.key('executor_workflow_inventory_head'),
                                      [('/record/coverage_birth', coverage.selector()), ('/record/revision', 1),
                                       ('/record/last_origin_operation_id', op_stop)], mutable=True,
                                      knob=w.knob('inventory_head'))
        goal_stop = w.goal_cause['original_stop_receipt'].selector()
        stop = sc.issue_physical('executor_workflow_scheduler_stop', 'native_consumer', WO + 'StorageSchedulerStop',
                                 sc.key('executor_workflow_scheduler_stop', op_stop),
                                 [('/record/operation_id', op_stop), ('/record/inventory_cut', inventory.selector()),
                                  ('/record/goal_stop', w.kval('scheduler_goal_stop', goal_stop)),
                                  ('/record/native_cancel_result', result.selector()),
                                  ('/record/native_cancel_origin', origin.selector()),
                                  ('/record/run_control_after', w.kval('scheduler_run_control', run_control.selector()))],
                                 knob=w.knob('scheduler_stop'))
        d01_stop_origin = w.d01.issue_physical('executor_workflow_mutation_origin_v2', 'native_consumer',
                                               WO + 'StorageMutationOrigin',
                                               w.d01.key('executor_workflow_mutation_origin_v2', op_stop),
                                               [('/record/operation_id', op_stop), ('/record/causation', stop.selector())])
        w.sched = dict(run_control=run_control, native_cancel_result=result, native_cancel_origin=origin,
                       coverage=coverage, inventory=inventory, scheduler_stop=stop, d01_stop_origin=d01_stop_origin)

    # -- FileSafe and disposable-process effect owners ---------------------------
    def _effects(self):
        w = self
        mutation = w.cfg.get('effects', 'none') == 'mutation'
        FI = 'https://puppetmaster.local/proposals/executor_filesafe_injective_key_sources.v1.schema.json#/$defs/'
        w.filesafe_invocations, w.process_effects = [], dict(births=[], admissions=[], termination_results=[],
                                                              shutdown_results=[], complete_original_origins=[])
        w.effect_ops = []
        w.process_invocations = []
        if not mutation:
            return
        for kind in w.cfg.get('filesafe', ['rollback']):
            op = 'TEST_ONLY:op:filesafe:' + uuid.uuid4().hex[:12]
            w.effect_ops.append(op)
            w.filesafe_invocations.append(w._filesafe_invocation(FI, op, kind))
        op = 'TEST_ONLY:op:process:' + uuid.uuid4().hex[:12]
        w.effect_ops.append(op)
        p = w.process
        birth = p.issue_physical('executor_process_birth', 'native_consumer', PS + 'ProcessBirthPhysical',
                                 p.key('executor_process_birth', op), [], knob=w.knob('process_birth'))
        admission = p.issue_physical('executor_process_shutdown_admission', 'native_consumer', PS + 'ShutdownAdmissionPhysical',
                                     p.key('executor_process_shutdown_admission', op), [], knob=w.knob('process_admission'))
        termination = p.issue_physical('executor_process_termination_result', 'native_consumer', PS + 'TerminationResultPhysical',
                                       p.key('executor_process_termination_result', op), [],
                                       knob=w.knob('process_termination'))
        shutdown = p.issue_physical('executor_process_shutdown_result', 'native_consumer', PS + 'ProcessShutdownResultPhysical',
                                    p.key('executor_process_shutdown_result', op), [], knob=w.knob('process_shutdown'))
        origin = p.issue_physical('executor_process_write_origin', 'native_consumer', PS + 'OriginalWriteOriginPhysical',
                                  p.key('executor_process_write_origin', op), [])
        w.process_effects = dict(births=[birth], admissions=[admission], termination_results=[termination],
                                 shutdown_results=[shutdown], complete_original_origins=[origin])
        invocation = w.seeder.seed('native_consumer', PS + 'ProcessInvocation')
        w.bind(invocation)
        invocation['invocation_id'] = op
        w.process_invocations = [dict(invocation=invocation, result=shutdown, origin=origin, operation_id=op)]

    def _filesafe_invocation(self, FI, op, kind):
        """One FileSafe invocation: binding, terminal journal and origin cells.

        Each is a whole original value under its FileSafe root, written at the
        family its original selector names; the consumer receives
        ``{selector, value}`` pairs whose selectors this owner issues.
        """
        w, f = self, self.filesafe
        out = dict(kind=kind, operation_id=op)
        for name, root, sel in (('binding', 'FileSafeInvocationBinding', 'BindingSelector'),
                                ('journal', 'OriginalRestoreTransaction', 'JournalSelector'),
                                ('origin', 'FileSafeJournalOrigin', 'OriginSelector')):
            template = w.seeder.seed('filesafe_consumer', FI + sel)
            family = template['family_id']
            value = f.build_wrapper(family, 'filesafe_consumer', FI + root, f.key(family, op), [],
                                    knob=w.knob('filesafe_' + name))
            stored = f.write_wrapper(family, 'filesafe_consumer', FI + root, f.key(family, op), value)
            selector = dict(template, storage_instance_id=w.sid, physical_key=stored.key, physical_sha256=stored.sha256)
            out[name] = dict(selector=selector, value=stored.wrapper, stored=stored)
        out['invocation'] = w.seeder.seed('filesafe_consumer', FI + 'FileSafeInvocation')
        w.bind(out['invocation'])
        out['invocation']['invocation_id'] = op
        return out

    # -- D05 bounded original safe stop ---------------------------------------------
    def _d05_family(self, name):
        seed = self.seeder.seed('native_consumer', SS + name)
        return seed['family_id']

    def _d05(self, name, disc, overlay=(), knob=None, choices=None):
        family = self._d05_family(name)
        return self.d05.issue_physical(family, 'native_consumer', SS + name, self.d05.key(family, disc), overlay,
                                       choices=choices, knob=knob)

    def _safe_stop(self):
        w = self
        aggregate_op = 'TEST_ONLY:op:d05-aggregate:' + uuid.uuid4().hex[:12]
        flush_op = 'TEST_ONLY:op:d05-flush:' + uuid.uuid4().hex[:12]
        w.ops.update(d05_aggregate=w.kval('d05_aggregate_op', aggregate_op), d05_flush=flush_op)
        aggregate_op = w.ops['d05_aggregate']
        sched, cause = w.sched, w.goal_cause
        origins = []

        def origin(op, disc):
            stored = w._d05('OriginPhysical', disc, [('/value/operation_id', op)])
            origins.append(stored)
            return stored

        def origin_ref(stored):
            return dict(storage_instance_id=w.sid, family_id=stored.family, schema_id=stored.wrapper['schema_id'],
                        schema_version=stored.wrapper['schema_version'], physical_key=stored.key,
                        operation_id=stored.wrapper['value']['operation_id'], codec='messagepack_canonical')
        reservation = w._d05('ReservationAllocationPhysical', 'reservation')
        compile_join = w._d05('CompileReservationJoinPhysical', 'compile', [('/value/allocation', reservation.d05())])
        workflow_join = w._d05('WorkflowReservationJoinPhysical', 'workflow', [('/value/allocation', reservation.d05()),
                                                                               ('/value/compile_join', compile_join.d05())])
        birth_origin = origin('TEST_ONLY:op:d05-birth:' + uuid.uuid4().hex[:12], 'domain-birth')
        domain_birth = w._d05('DomainBirthPhysical', 'domain', [('/value/origin', origin_ref(birth_origin)),
                                                                 ('/value/reservation_allocation', reservation.d05())],
                              knob=w.knob('domain_birth'))
        capabilities, dispositions = [], []
        for i, op in enumerate(w.effect_ops):
            cap = w._d05('CapabilityBirthPhysical', 'capability-%d' % i, [('/value/domain_birth', domain_birth.d05())])
            capabilities.append(cap)
            if w.knob('capability_reopened') != i:
                dispositions.append(w._d05('CapabilityDispositionPhysical', 'disposition-%d' % i,
                                           [('/value/capability_birth', cap.d05()),
                                            ('/value/capability_id', cap.wrapper['value']['capability_id'])],
                                           knob=w.knob('capability_disposition')))
        obligation = w._d05('ObligationBirthPhysical', 'obligation-final-flush', [('/value/domain_birth', domain_birth.d05())])
        flush_origin = origin(flush_op, 'final-flush')
        flushes = []
        statuses = w.cfg.get('flush', ['original_required_flush_durable'])
        for i, status in enumerate(statuses):
            flushes.append(w._d05('FinalFlushRecordPhysical', 'final-flush-%d' % i,
                                  [('/value/domain_birth', domain_birth.d05()), ('/value/aggregate_operation_id', aggregate_op),
                                   ('/value/operation_id', flush_op if i == len(statuses) - 1 else flush_op + ':%d' % i),
                                   ('/value/obligation', obligation.d05()), ('/value/status', status),
                                   ('/value/failure_stage', None if status == 'original_required_flush_durable'
                                    else 'segment_sync'),
                                   ('/value/origin', origin_ref(flush_origin))],
                                  knob=w.knob('final_flush')))
        cut = w._d05('DomainCutPhysical', 'final-cut', [('/value/domain_birth', domain_birth.d05()),
                                                         ('/value/original_stop', cause['original_stop_receipt'].selector()),
                                                         ('/value/scheduler_stop', sched['scheduler_stop'].selector()),
                                                         ('/value/inventory_cut', sched['inventory'].selector())],
                     knob=w.knob('domain_cut'))
        w.d05_cut_ref = cut.d05()
        pre_attempt = []
        if w.knob('pre_attempt_effect'):
            pre_attempt.append(w._d05('PreAttemptEffectAdmissionPhysical', 'pre-attempt',
                                      [('/value/domain_birth', domain_birth.d05()), ('/value/allocation', reservation.d05())]))
        aggregate_origin = origin(aggregate_op, 'aggregate')
        settlements = w._settlements()
        aggregate = w._d05('AggregateResultPhysical', 'aggregate',
                           [('/value/operation_id', aggregate_op),
                            ('/value/goal_stop', w.kval('d05_goal_stop', cause['original_stop_receipt'].selector())),
                            ('/value/scheduler_stop', sched['scheduler_stop'].selector()),
                            ('/value/inventory_cut', sched['inventory'].selector()),
                            ('/value/domain_birth', domain_birth.d05()), ('/value/final_domain_cut', cut.d05()),
                            ('/value/original_final_flush', flushes[-1].d05()),
                            ('/value/origin', origin_ref(aggregate_origin)),
                            ('/value/reservation_allocation', reservation.d05()),
                            ('/value/compile_reservation_join', compile_join.d05()),
                            ('/value/workflow_reservation_join', workflow_join.d05()),
                            ('/value/settlements', settlements)],
                           knob=w.knob('d05_aggregate'))
        w.safe_stop = dict(aggregate_result=aggregate, aggregate_origin=aggregate_origin, domain_birth=domain_birth,
                           final_domain_cut=cut, complete_required_flush_history=flushes, complete_core_writer_cuts=[],
                           complete_core_event_admissions=[], complete_capability_births=capabilities,
                           complete_capability_dispositions=dispositions, complete_obligations=[obligation],
                           reservation_allocation=reservation, compile_reservation_join=compile_join,
                           workflow_reservation_join=workflow_join, complete_original_origin_chain=origins,
                           complete_original_recovery_records=[],
                           original_native_cancel_result=sched['native_cancel_result'],
                           original_native_cancel_origin=sched['native_cancel_origin'],
                           original_scheduler_stop=sched['scheduler_stop'], original_inventory_cut=sched['inventory'],
                           original_coverage_birth=sched['coverage'], complete_d01_stop_origins=[sched['d01_stop_origin']],
                           complete_pre_attempt_effect_admissions=pre_attempt)

    def _settlements(self):
        """One SettlementCommitment per effect invocation, selecting the effect
        owner's actual terminal result and origin."""
        w = self
        out = []
        for inv in w.filesafe_invocations:
            out.append(dict(invocation=inv['invocation'], kind='filesafe_original_resolution',
                            original_result=inv['origin']['selector'], original_origin=inv['origin']['selector']))
        for inv in w.process_invocations:
            result = w.process_effects['termination_results'][0] if w.knob('settlement_process_termination') \
                else inv['result']
            out.append(dict(invocation=inv['invocation'], kind='process_original_shutdown',
                            original_result=result.d05(), original_origin=inv['origin'].d05()))
        if w.knob('settlements'):
            out = w.knob('settlements')(out)
        return out

    def settlement_refs(self):
        refs = [inv['journal']['stored'].family + ':' + inv['journal']['stored'].key for inv in self.filesafe_invocations]
        refs += [inv['result'].family + ':' + inv['result'].key for inv in self.process_invocations]
        return sorted(refs)

    def rollback_refs(self):
        return sorted(inv['journal']['stored'].family + ':' + inv['journal']['stored'].key
                      for inv in self.filesafe_invocations if inv['kind'] == 'rollback' or self.knob('extra_rollback'))

    def _other_birth(self, origin0):
        w = self
        return w.d01.issue_physical('executor_workflow_workflow_birth', 'native_consumer', WO + 'StorageWorkflowBirth',
                                    w.d01.key('executor_workflow_workflow_birth', 'other'),
                                    [('/record/operation_id', 'TEST_ONLY:op:other-birth'),
                                     ('/record/activation_body', w.body0.selector()),
                                     ('/record/activation_control', w.control0.selector()),
                                     ('/record/activation_origin', origin0.selector()),
                                     ('/record/birth_issuance', body_commitment(w, w.body0, w.control0))])

    def continue_d06_again(self):
        """A second positive cancellation attempt against the stale before-state."""
        self.knobs = dict(self.knobs, d06_op=None)
        self._d06()


    # -- D06 positive cancellation -----------------------------------------------------
    def idempotency_key(self, payload, partition):
        """EP-118: the exact cancelled-v3 idempotency key recipe."""
        tuple_ = ['pm.goal-runtime-event-idempotency.v3', partition, 'goal_run.cancelled', payload['project_id'],
                  payload['goal_id'], payload['goal_revision'], payload['expected_goal_run_revision'],
                  payload['goal_run_revision'], payload['payload']['goal_run_id'], 'user_cancelled',
                  payload['payload']['mutation_started']]
        raw = NR._call('d06/idempotency', NR.N.qualified_jcs, tuple_)
        return 'pm.goal-runtime-event.v3:' + sha256(raw)

    def mutation_census(self):
        """Effect owners' own statement: did any admitted mutation become durable?"""
        return bool(self.filesafe_invocations or self.process_effects['births'])

    def _event(self, op, before, after):
        w = self
        occurred = w.clock.now()
        NR.event_time(occurred, 'd06/occurred_at_utc')
        mutation = w.kval('mutation_flag', w.mutation_census())
        seeded = w.seeder.seed('native_consumer', SUBMISSION + '#/properties/payload')
        w.bind(seeded)
        payload = dict(event_name='goal_run.cancelled', schema_version='pm.goal_runtime_event.goal_run_cancelled.schema.v3',
                       occurred_at_utc=occurred, project_id=w.scope['project_id'], goal_id=w.scope['goal_id'],
                       goal_revision=w.goal_revision, actor_ref='TEST_ONLY:actor:user', execution_role='user',
                       requested_provider_ref='TEST_ONLY:provider', effective_provider_ref='TEST_ONLY:provider',
                       requested_model_ref='TEST_ONLY:model', effective_model_ref='TEST_ONLY:model',
                       requested_account_ref='TEST_ONLY:account', effective_account_ref='TEST_ONLY:account',
                       correlation_id='TEST_ONLY:correlation:' + op,
                       payload=dict(goal_run_id=w.scope['goal_run_id'], cancel_reason='user_cancelled',
                                    mutation_started=mutation),
                       expected_goal_run_revision=before.wrapper['record']['revision'],
                       goal_run_revision=after['record']['revision'], idempotency_key='')
        inner = dict(seeded['payload'], **payload['payload'])
        inner['settlement_refs'] = w.settlement_refs() if mutation else []
        if mutation and w.rollback_refs():
            inner['rollback_refs'] = w.rollback_refs()
        payload = dict(seeded, **payload)
        payload['payload'] = inner
        if w.knob('event_payload'):
            w.knob('event_payload')(payload)
        partition = 'project~' + S.k_component(w.scope['project_id'])
        payload['idempotency_key'] = w.idempotency_key(payload, partition)
        event = dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project',
                     event_id=str(uuid.uuid4()), event_type='goal_run.cancelled', project_id=w.scope['project_id'],
                     thread_id=None, run_id=None, node_id=None, attempt_id=None, actor_ref=payload['actor_ref'],
                     requested_account_ref=payload['requested_account_ref'],
                     effective_account_ref=payload['effective_account_ref'], occurred_at_utc=occurred,
                     producer_sequence_id=None, correlation_id=payload['correlation_id'],
                     causation_event_id=None, parent_event_id=None, idempotency_key=payload['idempotency_key'],
                     payload_schema_id='pm.goal_runtime_event.goal_run_cancelled.schema.v3', payload=payload,
                     payload_ref=None, redaction_profile='no_secrets',
                     replay_policy=w.kval('replay_policy', 'dedupe_by_idempotency_key'),
                     migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None,
                                    compatibility_event_type=None))
        return event

    def _d06(self):
        w, d = self, self.d06
        op = 'TEST_ONLY:op:d06:' + uuid.uuid4().hex[:12]
        tx = 'TEST_ONLY:d06-transaction:' + uuid.uuid4().hex[:12]
        w.ops['d06'] = w.kval('d06_op', op)
        op = w.ops['d06']
        owner = [('/record/workflow_owner_ref', w.ids['workflow_owner_ref']), ('/record/workflow_owner_epoch', 1)]
        scoped = [('/record/operation_id', op), ('/record/transaction_id', tx)]
        if w.knob('pre_cancel_events'):
            w.knob('pre_cancel_events')(w)
        before_body, before_control = w.body1, w.control1
        after_body = w.native.prepare_body(before_body, 'cancelled', knob=w.knob('native_after_body'))
        after_control = w.native.prepare_control(before_control, after_body, knob=w.knob('native_after_control'))
        event = w._event(op, before_body, after_body)
        submission = copy.deepcopy(event)
        candidate = d.issue_physical('workflow_cancel_event_candidate', 'native_consumer', D06 + 'StorageEventCandidate',
                                     d.key('workflow_cancel_event_candidate', op),
                                     scoped + [('/record/producer_submission', submission),
                                               ('/record/producer_semantic_digest', NR.producer_digest(submission))],
                                     knob=w.knob('event_candidate'))
        cause, sched, ss = w.goal_cause, w.sched, w.safe_stop
        common = [('/record/association_selection', cause['original_binding_selection'].selector()),
                  ('/record/goal_stop', w.kval('intent_goal_stop', cause['original_stop_receipt'].selector())),
                  ('/record/scheduler_stop', sched['scheduler_stop'].selector()),
                  ('/record/inventory_cut', sched['inventory'].selector()),
                  ('/record/safe_stop_source', ss['aggregate_result'].selector())]
        intent = d.issue_physical('workflow_cancel_intent', 'native_consumer', D06 + 'StorageIntent',
                                  d.key('workflow_cancel_intent', op),
                                  scoped + owner + common + [
                                      ('/record/before_body', before_body.selector()),
                                      ('/record/before_control', before_control.selector()),
                                      ('/record/prepared_body_sha256', physical_sha256(after_body)),
                                      ('/record/prepared_control_sha256', physical_sha256(after_control)),
                                      ('/record/kind', 'cancel_nonterminal'),
                                      ('/record/event_candidate', candidate.selector())],
                                  knob=w.knob('intent'))
        control_key = d.key('workflow_cancel_control', op)
        prepared = d.issue_physical('workflow_cancel_control', 'native_consumer', D06 + 'StorageControl', control_key,
                                    [('/record/operation_id', op), ('/record/revision', 1),
                                     ('/record/intent', intent.selector()), ('/record/phase', 'prepared'),
                                     ('/record/result', None), ('/record/last_origin_operation_id', op)],
                                    mutable=True)
        prepare_origin = d.issue_physical('workflow_cancel_origin', 'native_consumer', D06 + 'StorageOrigin',
                                          d.key('workflow_cancel_origin', op, 'prepare'),
                                          scoped + owner + [
                                              ('/record/issuer_method', 'owner.workflow.executor_cancel.prepare_disposition.v3'),
                                              ('/record/causation', cause['original_stop_receipt'].selector()),
                                              ('/record/afterimages', dict(kind='prepare', intent=intent.selector(),
                                                                           control=prepared.selector(),
                                                                           event_candidate=candidate.selector()))],
                                          knob=w.knob('prepare_origin'))
        w.d06_prepared = dict(event=event, candidate=candidate, intent=intent, control=prepared, origin=prepare_origin,
                              after_body=after_body, after_control=after_control, op=op, tx=tx, owner=owner,
                              scoped=scoped, common=common, control_key=control_key)
        w.d06_phase = 'prepared'
        if w.cfg.get('stop_after') == 'prepare':
            return
        w.continue_d06()

    def continue_d06(self):
        """Remaining D06 phases from the durable phase reached; re-entry resumes
        the same Storage reservation and never issues a second Event."""
        w, d = self, self.d06
        p = w.d06_prepared
        event, candidate, intent, prepared = p['event'], p['candidate'], p['intent'], p['control']
        prepare_origin = p['origin']
        after_body, after_control, op, tx = p['after_body'], p['after_control'], p['op'], p['tx']
        owner, scoped, common, control_key = p['owner'], p['scoped'], p['common'], p['control_key']
        before_body, before_control = w.body1, w.control1
        if w.d06_phase == 'prepared':
            # Native CAS: revision +1, status cancelled, activation unchanged.
            w.body2, w.control2 = w.native.commit(after_body, after_control, before_body, before_control)
            w.d06_phase = 'native'
            if w.cfg.get('stop_after') == 'native':
                return
        body2, control2 = w.body2, w.control2
        events, reservation, outcome = w.append.append_original('TEST_ONLY:append:' + op,
                                                               dict(op=op, candidate=candidate.sha256), [event],
                                                               durability_class=w.kval('durability_class', 'barrier'))
        custody = w.append.first_receipt(events[0])
        w.cancel_event, w.d06_reservation = events[0], reservation
        if w.d06_phase == 'native' and w.cfg.get('stop_after') == 'append':
            w.d06_phase = 'appended'
            return
        w.d06_phase = 'appended'
        result_key = d.key('workflow_cancel_result', op)
        receipt = copy.deepcopy(custody['first_append_receipt'])
        if w.knob('result_receipt'):
            w.knob('result_receipt')(receipt)
        result_wrapper = d.build_wrapper('workflow_cancel_result', 'native_consumer', D06 + 'StorageResult', result_key,
                                         scoped + owner + [c for c in common if c[0] != '/record/goal_stop'] + [
                                             ('/record/kind', 'cancelled_from_nonterminal'),
                                             ('/record/intent', intent.selector()),
                                             ('/record/before_body', before_body.selector()),
                                             ('/record/before_control', before_control.selector()),
                                             ('/record/after_body', body2.selector()),
                                             ('/record/after_control', control2.selector()),
                                             ('/record/append_receipt', receipt),
                                             ('/record/original_event_value',
                                              copy.deepcopy(custody['original_event_value_commitment'])),
                                             ('/record/action_authority', 'none'),
                                             ('/record/event_candidate', candidate.selector())],
                                         choices={'/record': 0}, knob=w.knob('result'))
        result = d.write_wrapper('workflow_cancel_result', 'native_consumer', D06 + 'StorageResult', result_key,
                                 result_wrapper, reservation=reservation)
        committed = d.issue_physical('workflow_cancel_control', 'native_consumer', D06 + 'StorageControl', control_key,
                                     [('/record/operation_id', op), ('/record/revision', w.kval('control_revision', 2)),
                                      ('/record/intent', intent.selector()), ('/record/phase', 'committed'),
                                      ('/record/result', result.selector()), ('/record/last_origin_operation_id', op)],
                                     mutable=True, knob=w.knob('committed_control'))
        publish_origin = d.issue_physical('workflow_cancel_origin', 'native_consumer', D06 + 'StorageOrigin',
                                          d.key('workflow_cancel_origin', op, 'publish'),
                                          scoped + owner + [
                                              ('/record/issuer_method', 'owner.workflow.executor_cancel.publish_disposition.v3'),
                                              ('/record/causation', intent.selector()),
                                              ('/record/afterimages', dict(kind='publish', result=result.selector(),
                                                                           control=committed.selector(),
                                                                           native_body=(before_body if w.knob(
                                                                               'publish_native_before') else body2).selector(),
                                                                           native_control=control2.selector()))],
                                          knob=w.knob('publish_origin'))
        prior_head = w.head
        revision = prior_head.wrapper['record']['revision'] + 1
        update = w._d01_update(op, 'd06_cancel_nonterminal', 'owner_status', (before_body, before_control),
                               (body2, control2), result, (prepare_origin if w.knob('d01_owner_origin_prepare')
                                                           else publish_origin).selector(), prior_head,
                               'owner.workflow.executor_cancel.publish_disposition.v3', revision)
        head = w._d01_head(revision, update, prior_head, w.start_cause.get('original_d01_head', prior_head) and
                           w._activation_body(), w.activation_origin)
        d01_origin = w._d01_origin('owner.executor.workflow_source.update_workflow.v3', 'TEST_ONLY:op:d01:' + op[-12:],
                                   (intent if w.knob('d01_causation_intent') else result).selector(), update, head)
        w.head = head
        w.d06_phase = 'published'
        w.cancellation = dict(event_candidate=candidate, intent=intent, committed_control=committed, result=result,
                              prepare_origin=prepare_origin, publish_origin=publish_origin, original_d01_update=update,
                              original_d01_head=head, original_d01_origin=d01_origin)
        w.custody = custody

    def replay_d06(self, request_edit=None, event_edit=None, operation=None):
        """Re-entry or retry of the published D06 append and terminal result.

        Same operation and request: the reservation resumes, Storage reports
        the group already appended, the first receipt and terminal result are
        the originals. A new operation with the same Event dedupes. Any altered
        request or producer field conflicts in Storage.
        """
        p = self.d06_prepared
        op = operation or p['op']
        request = dict(op=op, candidate=p['candidate'].sha256)
        if request_edit:
            request = request_edit(request)
        event = copy.deepcopy(p['event'])
        if event_edit:
            event_edit(event)
        events, reservation, outcome = self.append.append_original('TEST_ONLY:append:' + op, request, [event],
                                                                   durability_class='barrier')
        custody = self.append.first_receipt(events[0])
        tx = None
        if operation is None:
            result = self.cancellation['result']
            tx = self.storage.publish_terminal(reservation, result.family, result.key, result.wrapper)
        return dict(outcome=outcome, custody=custody, tx=tx)

    def _activation_body(self):
        head = self.start_cause.get('original_d01_head')
        if head is None:
            return self.body0
        return self.body1


class _NonNull(dict):
    """Seeder choice map: every oneOf/anyOf takes its first non-null variant."""

    def get(self, path, default=None):
        return lambda variants: next((i for i, v in enumerate(variants) if v.get('type') != 'null'), 0)


def _issued_by_value(self, value):
    sha = physical_sha256(value)
    hits = [s for (f, k, h), s in self.issued.items() if h == sha]
    return hits[0] if len(hits) == 1 else None


def _filesafe_kind(self, key):
    return next((i['kind'] for i in self.filesafe_invocations if i['journal']['stored'].key == key), None)


World.issued_by_value = _issued_by_value
World.filesafe_kind = _filesafe_kind


def _storage_close(self):
    """Hand the Storage directory to another process (no in-process writes)."""
    self._closed_storage = self.storage


def _storage_reopen(self):
    """Fresh-process-equivalent reopen from the durable bytes; rewire owners."""
    storage = S.TestOwnerStorage.open(self.tmp / 'storage')
    A.require('reopen/instance', storage.storage_instance_id == self.sid)
    self.storage = storage
    self.append.storage = storage
    self.clock.storage = storage
    self.registry.recorder.observe('storage:' + storage.storage_instance_id, storage.observe)
    return storage


World.storage_close = _storage_close
World.storage_reopen = _storage_reopen
