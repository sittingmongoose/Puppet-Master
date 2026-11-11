#!/usr/bin/env python3
"""TEST_ONLY issuer framework: independently issuing owner adapters and an
ordered modeled method-call recorder.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Owners issue originals into their own private custody and hand out opaque
``OriginalHandle`` capabilities. A consumer acquires an original only through
the ``OwnerRegistry`` (registered owner object, exact role) and the issuing
owner's ``resolve``. Presented JSON never becomes authority:

* a dict, a copied value, a matching digest or a matching ``original_ref``
  string is not a handle;
* a handle from another owner, or an owner object that is not the registered
  one for that id, refuses;
* ``authenticate`` compares presented bytes with the owner's retained
  canonical bytes and returns the retained value, never the presented one.

Original roots: each original carries the exact schema root it was issued
under and is validated against a pinned whole bank (``RootBank``) at issue.
Original banks, URIs and hashes are loaded byte-exact and never rewritten.

The ``MethodRecorder`` records every modeled call in order with owner, method,
argument digest, before and after observations of every registered owner and
Storage, the result digest or refusal code, and nesting, so a family lane can
compose and assert a complete original path.
"""
from __future__ import annotations

from contextlib import contextmanager
import copy
import hashlib
import json
from pathlib import Path
import uuid
import weakref

import jsonschema
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
ROOT = NR.ROOT


class AdapterRefusal(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code


def require(code, condition):
    if not condition:
        raise AdapterRefusal(code)


def refusal_code(error):
    return getattr(error, 'code', None) or getattr(error, 'reason', None) or type(error).__name__


def sha256(raw):
    return hashlib.sha256(raw).hexdigest()


def canonical(value, where='adapter/canonical'):
    try:
        return NR.event_value_bytes(value, where)
    except NR.NumruleRefusal as error:
        raise AdapterRefusal(error.reason) from error


def digest(value):
    return sha256(canonical(value))


def same(a, b):
    """Type-exact recursive equality (1 != 1.0 != True; no codec domain)."""
    if type(a) is not type(b):
        return False
    if type(a) is dict:
        return a.keys() == b.keys() and all(same(a[k], b[k]) for k in a)
    if type(a) is list:
        return len(a) == len(b) and all(same(x, y) for x, y in zip(a, b))
    return a == b


def observation_digest(value):
    """Recorder digest. It observes and never refuses: values the physical
    profile cannot hold (an arbitrary-precision revision, a float under test)
    fall back to tagged exact JSON so the recorder adds no numeric domain."""
    try:
        return sha256(canonical(value))
    except AdapterRefusal:
        return sha256(b'json\0' + json.dumps(value, sort_keys=True, ensure_ascii=False, default=repr).encode())


# ------------------------------------------------------------------ roots

class RootBank:
    """Pinned whole-schema bank. Files are loaded byte-exact and hash-checked."""

    def __init__(self, resources):
        self.documents, self.pins = {}, {}
        pairs = []
        for entry in resources:
            raw = (ROOT / entry['path']).read_bytes()
            if entry.get('sha256') is not None:
                require('bank/whole_hash/' + entry['path'], sha256(raw) == entry['sha256'])
            document = json.loads(raw)
            uri = entry.get('retrieval_uri') or document.get('$id')
            require('bank/uri/' + entry['path'], type(uri) is str and uri != '')
            require('bank/no_rebinding/' + uri, uri not in self.pins or self.pins[uri] == sha256(raw))
            self.documents[uri] = document
            self.pins[uri] = sha256(raw)
            pairs.append((uri, Resource.from_contents(document, default_specification=DRAFT202012)))
        self.registry = Registry().with_resources(pairs).crawl()

    def errors(self, root, value):
        validator = jsonschema.Draft202012Validator({'$ref': root}, registry=self.registry)
        return sorted(validator.iter_errors(value), key=lambda e: list(e.absolute_path))

    def validate(self, root, value, code='root'):
        errors = self.errors(root, value)
        if errors:
            raise AdapterRefusal(code + '/schema/' + '/'.join(str(p) for p in errors[0].absolute_path))
        return value


# ------------------------------------------------------------------ handles

class OriginalHandle:
    """Opaque capability for one issued original. Not serializable or copyable."""
    __slots__ = ('__weakref__', 'kind')

    def __init__(self, kind='original'):
        self.kind = kind

    def __repr__(self):
        return '<TEST_ONLY original handle>'

    def __reduce__(self):
        raise AdapterRefusal('handle/not_serializable')

    def __copy__(self):
        raise AdapterRefusal('handle/not_copyable')

    def __deepcopy__(self, memo):
        raise AdapterRefusal('handle/not_copyable')


class OwnerRegistry:
    """TEST_ONLY service registration: exactly one owner object per id and role."""

    def __init__(self, recorder=None):
        self.registry_id = 'TEST_ONLY:registry:' + str(uuid.uuid4())
        self._owners, self._roles = {}, {}
        self.recorder = recorder or MethodRecorder()

    def register(self, owner, role):
        require('registry/role_type', type(role) is str and role != '')
        require('registry/duplicate_id', owner.owner_id not in self._owners)
        self._owners[owner.owner_id] = owner
        self._roles[owner.owner_id] = role
        self.recorder.observe(owner.owner_id, owner.observe)

    def owner(self, owner_id, role):
        owner = self._owners.get(owner_id)
        require('registry/unregistered_owner', owner is not None)
        require('registry/role', self._roles[owner_id] == role)
        return owner

    def authenticate_owner(self, owner, role):
        require('registry/owner_type', isinstance(owner, TestOwner))
        registered = self._owners.get(owner.owner_id)
        require('registry/unregistered_owner', registered is not None)
        require('registry/owner_identity', registered is owner)
        require('registry/role', self._roles[owner.owner_id] == role)
        return owner

    def roster(self):
        return {owner_id: self._roles[owner_id] for owner_id in sorted(self._owners)}


# ------------------------------------------------------------------ recorder

class MethodRecorder:
    """Ordered modeled method calls with before/after observations."""

    def __init__(self):
        self.calls = []
        self._observers = {}
        self._stack = []

    def observe(self, name, function):
        self._observers[name] = function

    def snapshot(self):
        out = {}
        for name in sorted(self._observers):
            value = self._observers[name]()
            out[name] = dict(value=copy.deepcopy(value), sha256=observation_digest(value))
        return out

    @contextmanager
    def call(self, owner_id, method, args=None):
        record = dict(index=len(self.calls) + len(self._stack), owner=owner_id, method=method,
                      parent=self._stack[-1]['index'] if self._stack else None,
                      args_sha256=None if args is None else observation_digest(args), before=self.snapshot(),
                      result_sha256=None, refusal=None, qualification=QUALIFICATION)
        self._stack.append(record)

        class Slot:
            def set(slot, result):
                record['result_sha256'] = None if result is None else observation_digest(result)
                return result
        try:
            yield Slot()
        except (AdapterRefusal, S.StorageRefusal, NR.NumruleRefusal) as error:
            record['refusal'] = refusal_code(error)
            raise
        finally:
            self._stack.pop()
            record['after'] = self.snapshot()
            record['changed'] = sorted(name for name in record['after']
                                       if record['after'][name]['sha256'] != record['before'].get(name, {}).get('sha256'))
            self.calls.append(record)
            self.calls.sort(key=lambda r: r['index'])

    def sequence(self, top_level_only=False):
        return [(c['owner'], c['method']) for c in self.calls if not (top_level_only and c['parent'] is not None)]

    def require_order(self, expected, top_level_only=True):
        actual = [m for _, m in self.sequence(top_level_only)]
        require('recorder/order', actual == list(expected))

    def changed_by(self, method):
        return [c['changed'] for c in self.calls if c['method'] == method]

    def export(self):
        return [dict({k: v for k, v in c.items() if k not in ('before', 'after')},
                     before_sha256={n: o['sha256'] for n, o in c['before'].items()},
                     after_sha256={n: o['sha256'] for n, o in c['after'].items()}) for c in self.calls]


# ------------------------------------------------------------------ owners

def exact_json(value, where='custody/exact_json'):
    """Exact source JSON custody codec: sorted keys, exact integers, no floats.

    Used by owners whose originals carry arbitrary-precision integers that the
    physical MessagePack profile cannot hold; it adds no numeric cap.
    """
    def check(v):
        if type(v) is float:
            raise AdapterRefusal(where + '/float')
        if type(v) is int:
            NR.integer(v, where)
        elif type(v) is dict:
            for k, x in v.items():
                require(where + '/key', type(k) is str)
                check(x)
        elif type(v) is list:
            for x in v:
                check(x)
        elif type(v) is str:
            v.encode('utf-8', 'strict')
        else:
            require(where + '/type', v is None or type(v) is bool)
    check(value)
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'), sort_keys=True,
                      allow_nan=False).encode('utf-8')


CODECS = {
    'msgpack': (lambda v: canonical(v, 'issue/canonical'), lambda raw: NR.decode_event_value(raw, 'resolve')),
    'exact_json': (exact_json, lambda raw: json.loads(raw.decode('utf-8'))),
}


class TestOwner:
    """Base TEST_ONLY owner: private original custody and opaque handles."""

    role = 'owner'
    custody_codec = 'msgpack'

    def __init__(self, registry, *, owner_id=None, bank=None, owner_epoch=1):
        self.owner_id = owner_id or 'TEST_ONLY:owner:%s:%s' % (self.role, uuid.uuid4())
        self.owner_epoch = NR.integer(owner_epoch, 'owner/epoch', minimum=0)
        self.bank = bank
        self.registry = registry
        self.recorder = registry.recorder
        self._originals = {}
        self._handles = weakref.WeakKeyDictionary()
        self._sequence = 0
        self.withdrawn = set()
        registry.register(self, self.role)

    # issuance ------------------------------------------------------------
    def _issue(self, root, value, *, kind, ref=None):
        if self.bank is not None and root is not None:
            self.bank.validate(root, value, 'issue/' + kind)
        raw = CODECS[self.custody_codec][0](value)
        self._sequence = NR.uint64(self._sequence + 1, 'owner/sequence')
        ref = ref or 'TEST_ONLY:original:%s:%s:%d' % (self.owner_id, kind, self._sequence)
        require('issue/immutable_ref', ref not in self._originals)
        self._originals[ref] = dict(root=root, raw=raw, sha256=sha256(raw), kind=kind, owner_id=self.owner_id,
                                    owner_epoch=self.owner_epoch, issued_sequence=self._sequence)
        handle = OriginalHandle(kind)
        self._handles[handle] = ref
        return handle

    def issue(self, root, value, *, kind='source', ref=None):
        with self.recorder.call(self.owner_id, 'issue:' + kind, dict(root=root, value=value)) as slot:
            handle = self._issue(root, value, kind=kind, ref=ref)
            slot.set(dict(ref=self._handles[handle]))
            return handle

    # custody ---------------------------------------------------------------
    def _ref(self, handle):
        require('original/handle_type', type(handle) is OriginalHandle)
        require('original/issuer', handle in self._handles)
        ref = self._handles[handle]
        require('original/withdrawn', ref not in self.withdrawn)
        return ref

    def resolve(self, handle, *, root=None):
        """Return (ref, retained value) for a handle this owner issued."""
        ref = self._ref(handle)
        record = self._originals[ref]
        if root is not None:
            require('original/root', record['root'] == root)
        return ref, CODECS[self.custody_codec][1](record['raw'])

    def authenticate(self, ref, presented, *, root=None):
        """Presented bytes must equal retained bytes; returns the retained value."""
        require('original/ref_type', type(ref) is str)
        record = self._originals.get(ref)
        require('original/unissued', record is not None)
        require('original/withdrawn', ref not in self.withdrawn)
        if root is not None:
            require('original/root', record['root'] == root)
        require('original/bytes', CODECS[self.custody_codec][0](presented) == record['raw'])
        return CODECS[self.custody_codec][1](record['raw'])

    def custody(self, handle):
        ref = self._ref(handle)
        record = self._originals[ref]
        return dict(qualification=QUALIFICATION, original_ref=ref, owner_id=self.owner_id,
                    owner_epoch=record['owner_epoch'], root=record['root'], kind=record['kind'],
                    sha256=record['sha256'])

    def verify_custody(self, custody):
        """A presented custody record is checked against the retained one."""
        require('custody/type', type(custody) is dict)
        record = self._originals.get(custody.get('original_ref'))
        require('custody/unissued', record is not None)
        for field in ('owner_id', 'owner_epoch', 'root', 'kind', 'sha256'):
            require('custody/' + field, custody.get(field) == (self.owner_id if field == 'owner_id' else record[field]))
        return True

    def inventory(self, kind):
        """Complete owner inventory; an empty list is an owner statement, never a caller's."""
        return sorted(ref for ref, r in self._originals.items() if r['kind'] == kind and ref not in self.withdrawn)

    def withdraw(self, handle):
        self.withdrawn.add(self._ref(handle))

    def observe(self):
        return dict(owner_epoch=self.owner_epoch, originals=len(self._originals),
                    withdrawn=len(self.withdrawn),
                    last=max((r['issued_sequence'] for r in self._originals.values()), default=0))


def acquire(registry, owner_id, role, handle, *, root=None):
    """The only acquisition route: registered owner, exact role, owner-issued handle."""
    owner = registry.owner(owner_id, role)
    with registry.recorder.call(owner_id, 'acquire:' + role, dict(root=root)) as slot:
        ref, value = owner.resolve(handle, root=root)
        slot.set(dict(ref=ref))
        return ref, value


class SourceOwner(TestOwner):
    role = 'source'


class ActivationOwner(TestOwner):
    """Births subjects and issues transition receipts with a current-state CAS."""
    role = 'activation'

    def __init__(self, registry, **kwargs):
        super().__init__(registry, **kwargs)
        self.state = {}

    def birth(self, subject, initial, *, root=None, value=None):
        require('activation/subject_type', type(subject) is str and subject != '')
        require('activation/unborn', subject not in self.state)
        with self.recorder.call(self.owner_id, 'birth', dict(subject=subject, initial=initial)) as slot:
            record = value if value is not None else dict(qualification=QUALIFICATION, subject=subject,
                                                          state=initial, revision=0)
            handle = self._issue(root, record, kind='birth')
            self.state[subject] = dict(state=initial, revision=0, last=self._handles[handle])
            slot.set(record)
            return handle

    def transition(self, subject, expected_state, expected_revision, new_state, *, cause_ref, root=None):
        current = self.state.get(subject)
        require('activation/unborn_subject', current is not None)
        NR.uint64(expected_revision, 'activation/expected_revision')
        with self.recorder.call(self.owner_id, 'transition',
                                dict(subject=subject, expected=expected_state, revision=expected_revision,
                                     new=new_state, cause_ref=cause_ref)) as slot:
            require('activation/cas_state', current['state'] == expected_state)
            require('activation/cas_revision', current['revision'] == expected_revision)
            require('activation/cause_type', type(cause_ref) is str and cause_ref != '')
            revision = NR.uint64(expected_revision + 1, 'activation/revision')
            receipt = dict(qualification=QUALIFICATION, subject=subject, from_state=expected_state,
                           to_state=new_state, revision=revision, cause_ref=cause_ref,
                           prior_ref=current['last'])
            handle = self._issue(root, receipt, kind='transition')
            self.state[subject] = dict(state=new_state, revision=revision, last=self._handles[handle])
            slot.set(receipt)
            return handle

    def current(self, subject):
        value = self.state.get(subject)
        return None if value is None else copy.deepcopy(value)

    def observe(self):
        return dict(super().observe(), subjects={k: [v['state'], v['revision']] for k, v in sorted(self.state.items())})


class AppendOwner(TestOwner):
    """Wraps the TEST_ONLY Storage append; the Event and first receipt are Storage's."""
    role = 'append'

    def __init__(self, registry, storage, **kwargs):
        super().__init__(registry, **kwargs)
        require('append_owner/storage', isinstance(storage, S.TestOwnerStorage))
        self.storage = storage
        registry.recorder.observe('storage:' + storage.storage_instance_id, storage.observe)
        self._events = weakref.WeakKeyDictionary()

    def append_original(self, operation_id, request, candidates, *, durability_class='ordinary'):
        with self.recorder.call(self.owner_id, 'append_original',
                                dict(operation_id=operation_id, request=request)) as slot:
            if self.storage.reservation_state(operation_id) is None:
                handle = self.storage.reserve(operation_id, request)
            else:
                handle, _ = self.storage.resume(operation_id, request)
            outcome = self.storage.append(handle, candidates, durability_class=durability_class)
            receipts = self.storage.issue_first_receipt(handle)
            events = []
            for receipt in receipts:
                row = self.storage.receipt_of(receipt)
                event_handle = OriginalHandle('event')
                self._events[event_handle] = (row['event_id'], receipt)
                events.append(event_handle)
            slot.set(dict(outcome=outcome, event_ids=[self._events[h][0] for h in events]))
            self._last_reservation = handle
            return events, handle, outcome

    def event(self, handle):
        require('event/handle_type', type(handle) is OriginalHandle)
        require('event/issuer', handle in self._events)
        event_id, _ = self._events[handle]
        return self.storage.read_event(event_id)

    def first_receipt(self, handle):
        require('event/handle_type', type(handle) is OriginalHandle)
        require('event/issuer', handle in self._events)
        _, receipt = self._events[handle]
        return self.storage.receipt_of(receipt)


class PublicationOwner(TestOwner):
    """Terminal publication through the Storage transaction (CAS from absent)."""
    role = 'publication'

    def __init__(self, registry, storage, **kwargs):
        super().__init__(registry, **kwargs)
        self.storage = storage
        self._published = {}

    def publish(self, reservation, table, key, value, *, root=None):
        with self.recorder.call(self.owner_id, 'publish_terminal', dict(table=table, key=key, value=value)) as slot:
            if self.bank is not None and root is not None:
                self.bank.validate(root, value, 'publish')
            tx = self.storage.publish_terminal(reservation, table, key, value)
            if (table, key) in self._published:
                # Equal replay returns the one original publication; no second issuance.
                require('publish/replay_tx', tx.get('replay') is True)
                handle = self._published[(table, key)]
            else:
                handle = self._issue(None, dict(qualification=QUALIFICATION, table=table, key=key,
                                                tx_id=tx['tx_id'], value_sha256=digest(value)), kind='publication')
                self._published[(table, key)] = handle
            slot.set(tx)
            return handle, tx
