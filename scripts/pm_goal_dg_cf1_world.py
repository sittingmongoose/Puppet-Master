#!/usr/bin/env python3
"""DG-CF1 TEST_ONLY owners for goal_run.certified CF-01..CF-05 on the shared adapters.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Lane DG-CF1 (stream E, 2026-11-11). Every owner here is a registered TEST_ONLY
owner on the adapter `OwnerRegistry`; every value it hands out comes from its
own execution and stays in its private custody:

* CF-04 `ProfileOwner` reads the actual installed descriptor bytes, verifies
  every member's whole bytes, the producer subprofile digest, the acyclic
  digest DAG and the descriptor digest recipe, and runs eager qualification of
  every realm (W5 precondition, read-only) before any birth.
* CF-05 `BirthCoordinator` runs B1: the native owner derives the whole native
  birth first, the compact Birth selecting it second, the empty Control
  selecting Birth third, and ONE Storage transaction coissues all of them under
  key absence; no intermediate durable visibility.
* CF-03 `NativeRunOwner` executes the successful native chain: Start, every
  required WorkNode's attempt lifecycle (begin, submit, record_verified,
  complete), progress, provisional success, each as a Storage transaction
  with its D01 update/head/origin. `FinalDecisionOwner` evaluates G1-G8 and
  Document Packaging from the native store and issues the receipt;
  `StandardOwner` captures the durable Standard; `prepare_certified` derives
  the CertificationCandidateResult (verifying/provisional_success to
  certified, revision +1).
* CF-02 assignment, invocation, resolver, reference, causal and Storage
  partition/route owners issue their whole producer-realm roots; every
  `structured_original` node inside them carries bytes the issuing owner
  holds in custody, recorded by one Storage issuance transaction.
* CF-01 identity and producer preparation reuse the adapter demonstration's
  recipe (I1 LP tuple, K, E and the independent recomputation), here over the
  whole roots, and validate the whole producer submission.

Whole roots are composed with `pm_goal_dg_cf1_compose` and validated in their
isolated realms. The coordinator-side predicates (I0, F1/U/G, F3, B1, Q-style
helper/final boundaries) recompute every join they rely on from fresh
acquisitions; nothing is trusted because it matches.

DG-CF2 integration: `World.cf2_inputs()` returns the whole
OriginalCertificationSource, CertificationCandidateResult, WholeProducerSource
and CurrentWorkflowSource issued here, by owner handle, for the DG merge.
"""
from __future__ import annotations

import base64
import copy
import fnmatch
import hashlib
import json
from pathlib import Path
import random

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_test_demo_cf01 as D
import pm_goal_dg_cf1_compose as C

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
ROOT = NR.ROOT
Refusal = A.AdapterRefusal
require = A.require

COORD_PKG = 'Plans/goal_certified_event_coordinator_contracts/'
PRODUCER_PKG = 'Plans/goal_certified_producer_source_contracts/'
NATIVE_PKG = 'Plans/workflow_standard_source_contracts/'
COORD = 'https://puppetmaster.local/proposals/goal_certified_event_coordinator.v1.schema.json#/$defs/'
IDENT = 'https://puppetmaster.local/proposals/goal_certified_event_identity.v1.schema.json#/$defs/'
NS = 'https://puppetmaster.local/proposals/workflow_standard_current_source.v4.schema.json#/$defs/'

# native store tables (compact native database records; whole roots are acquisitions over them)
T_BODY = 'TEST_ONLY:cf1_native_body'
T_CONTROL = 'TEST_ONLY:cf1_native_control'
T_BIRTH = 'TEST_ONLY:cf1_native_birth'
T_HEAD = 'TEST_ONLY:cf1_d01_head'
T_UPDATE = 'TEST_ONLY:cf1_d01_update'
T_ORIGIN = 'TEST_ONLY:cf1_d01_origin'
T_WORKNODE = 'TEST_ONLY:cf1_worknode'
T_ATTEMPT = 'TEST_ONLY:cf1_attempt'
T_CRITERION = 'TEST_ONLY:cf1_criterion'
T_VALIDATOR = 'TEST_ONLY:cf1_validator'
T_AUDITOR = 'TEST_ONLY:cf1_auditor'
T_BLOCKER = 'TEST_ONLY:cf1_blocker'
T_ARTIFACT = 'TEST_ONLY:cf1_artifact'
T_DOCSET = 'TEST_ONLY:cf1_document_set'
T_SOURCE_CONTROL = 'TEST_ONLY:cf1_source_control'
T_DECISION = 'TEST_ONLY:cf1_final_decision'
T_STANDARD = 'TEST_ONLY:cf1_standard_receipt'
T_STANDARD_ORIGIN = 'TEST_ONLY:cf1_standard_capture_origin'
T_COORD_BIRTH = 'TEST_ONLY:cf1_coordinator_birth'
T_COORD_CONTROL = 'TEST_ONLY:cf1_coordinator_control'
T_GOAL_BODY = 'TEST_ONLY:cf1_goal_body'
T_GOAL_CONTROL = 'TEST_ONLY:cf1_goal_control'
T_GOAL_BINDING = 'TEST_ONLY:cf1_goal_binding'
T_ASSIGNMENT = 'TEST_ONLY:cf1_assignment_current'
T_ISSUANCE = 'TEST_ONLY:cf1_structured_issuance'
DOC_BYTES = 262144
DOC_TOKENS = 65536


# ------------------------------------------------------------------ roots

def _method_roots():
    methods = json.loads((ROOT / COORD_PKG / 'methods.json').read_bytes())
    out = {}
    for method in methods['methods']:
        for argument in method['arguments']:
            out.setdefault(argument['schema_ref'].rsplit('/', 1)[-1], (argument['realm'], argument['schema_ref']))
        for variant in method['return_variants']:
            for result in variant['results']:
                out.setdefault(result['schema_ref'].rsplit('/', 1)[-1], (result['realm'], result['schema_ref']))
    out['CurrentWorkflowSource'] = ('native', NS + 'CurrentWorkflowSource')
    return methods, out


METHODS, ROOTS = _method_roots()
SUBMISSION = 'goal_certified_producer_submission.v1.schema.json'


def method(name):
    for m in METHODS['methods']:
        if m['method'] == name:
            return m
    raise KeyError(name)


def rvalidate(name, value, code):
    realm, uri = ROOTS[name]
    errors = C.validate(realm, uri, value)
    if errors:
        first = sorted(errors, key=lambda e: (len(list(e.absolute_path)), list(map(str, e.absolute_path))))[0]
        raise Refusal(code + '/schema/' + '/'.join(map(str, first.absolute_path)))
    return value


# ------------------------------------------------------------------ codecs and paths

def sj(value):
    """pm.goal.certified_producer_source_json.v1 / CV-340 source JSON (adapter demo codec)."""
    return D.source_json(value)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def b64(raw):
    return base64.b64encode(raw).decode('ascii')


def hsj(value):
    return sha(sj(value))


def get(value, path):
    for part in path.split('/'):
        if part == '':
            continue
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value


def put(value, path, new):
    parts = [p for p in path.split('/') if p != '']
    target = value
    for part in parts[:-1]:
        target = target[int(part)] if isinstance(target, list) else target[part]
    last = parts[-1]
    if isinstance(target, list):
        target[int(last)] = new
    else:
        target[last] = new


def nodes(value, path=''):
    yield path, value
    if isinstance(value, dict):
        for k, v in value.items():
            yield from nodes(v, path + '/' + k if path else k)
    elif isinstance(value, list):
        for i, v in enumerate(value):
            yield from nodes(v, path + '/' + str(i) if path else str(i))


def put_all(value, name, new):
    """Every property called `name`, anywhere (identity copies)."""
    for path, node in list(nodes(value)):
        if isinstance(node, dict) and name in node:
            node[name] = copy.deepcopy(new)


def glob_paths(value, pattern):
    return [p for p, _ in nodes(value) if fnmatch.fnmatchcase(p, pattern)]


def expand(value, path, items):
    """Replace list at `path` with clones of its first composed item, each edited by `items[i]`."""
    seq = get(value, path)
    require('compose/expand_template', type(seq) is list and len(seq) >= 1)
    template = seq[0]
    out = []
    for edit in items:
        item = copy.deepcopy(template)
        edit(item)
        out.append(item)
    put(value, path, out)


class CF1Storage(S.TestOwnerStorage):
    def now(self):
        return self._tick()


# ------------------------------------------------------------------ structured originals

class IssuingOwner(A.TestOwner):
    """Owner that seals every structured original of the whole roots it issues."""

    custody_codec = 'exact_json'

    def __init__(self, registry, world, **kw):
        super().__init__(registry, **kw)
        self.world = world
        self._structured = {}
        self._ops = 0

    def next_op(self, tag):
        self._ops += 1
        return 'TEST_ONLY:operation:%s:%s:%d' % (self.role, tag, self._ops)

    def seal(self, value, *, tag, scope):
        """Re-issue every structured_original node from a record this owner holds."""
        w = self.world
        op = self.next_op(tag)
        pending = []
        for path, node in list(nodes(value)):
            if isinstance(node, dict) and node.get('source_kind') == 'structured_original' and 'complete_value' in node:
                prior = w.owner_by_id(node['identity'].get('owner_ref'))
                if isinstance(prior, IssuingOwner) and prior.holds(node['complete_value'].get('sha256')):
                    continue  # an embedded original another owner already issued stays byte-exact
                pending.append((path, node))
        issued_at = w.storage.now()
        digests = []
        for path, node in pending:
            record = dict(qualification=QUALIFICATION, owner=self.owner_id, role=self.role, path=path,
                          scope=scope, issued_by_operation=op, content=node.get('_record', path))
            raw = sj(record)
            schema = dict(title='TEST_ONLY ' + self.role + ' ' + path.rsplit('/', 1)[-1], type='object',
                          required=sorted(record))
            schema_raw = sj(schema)
            node['identity'].update(owner_ref=self.owner_id, owner_epoch=self.owner_epoch,
                                    owner_method='TEST_ONLY:%s.issue_original.v1' % self.role,
                                    original_operation_id=op, source_ref='TEST_ONLY:source:%s:%s' % (self.role, path),
                                    source_revision=1, issued_at_utc=issued_at,
                                    source_codec='pm.goal.certified_producer_source_json.v1', source_sha256=sha(raw))
            node['scope'] = dict(scope_kind='project', project_id=scope['project_id'], thread_id=scope.get('thread_id'),
                                 run_id=scope['goal_run_id'], node_id=None, attempt_id=None)
            node['schema_resource'] = dict(literal_uri='TEST_ONLY:schema:%s:%s' % (self.role, path),
                                           whole_schema=dict(bytes_base64=b64(schema_raw), byte_count=len(schema_raw),
                                                             sha256=sha(schema_raw)),
                                           original_definition_pointer='', installed_source_role=self.role)
            node['complete_value'] = dict(bytes_base64=b64(raw), byte_count=len(raw), sha256=sha(raw))
            self._structured[sha(raw)] = raw
            digests.append(sha(raw))
        if digests:
            tx = w.storage.transact([dict(table=T_ISSUANCE, key=S.k_component(op), expected=None,
                                          value=dict(qualification=QUALIFICATION, owner=self.owner_id, operation=op,
                                                     node_count=len(digests),
                                                     nodes_sha256=sha(''.join(sorted(digests)).encode())))])
            for path, node in pending:
                node['identity']['original_transaction_id'] = tx['tx_id']
        return value

    def holds(self, digest):
        return digest in self._structured


def authenticate_structured(world, value, code, scope):
    """Every structured original must be bytes its registered issuer holds, issued in a real transaction."""
    count = 0
    for path, node in nodes(value):
        if not (isinstance(node, dict) and node.get('source_kind') == 'structured_original'):
            continue
        count += 1
        cv = node['complete_value']
        raw = base64.b64decode(cv['bytes_base64'], validate=True)
        require(code + '/structured/byte_count', len(raw) == cv['byte_count'])
        require(code + '/structured/sha256', sha(raw) == cv['sha256'] == node['identity']['source_sha256'])
        owner = world.owner_by_id(node['identity']['owner_ref'])
        require(code + '/structured/owner_unregistered', owner is not None and isinstance(owner, IssuingOwner))
        require(code + '/structured/unissued', owner.holds(cv['sha256']))
        record = json.loads(raw)
        require(code + '/structured/scope', record['scope']['goal_run_id'] == scope['goal_run_id'] and
                node['scope']['run_id'] == scope['goal_run_id'] and node['scope']['project_id'] == scope['project_id'])
        row = world.storage.cell(T_ISSUANCE, S.k_component(node['identity']['original_operation_id']))
        require(code + '/structured/transaction', row is not None and row['tx'] ==
                node['identity']['original_transaction_id'] and row['value']['owner'] == owner.owner_id)
    return count


# ------------------------------------------------------------------ CF-04 profile

_QUALIFICATION = {}


def qualification(edit=None):
    """Eager reference closure of every realm (W5 precondition). The unedited report is
    computed once per process from the same whole bytes; edited banks are recomputed."""
    from pm_goal_own_c3_w5_oracles import LOCATIONS, OriginalPrecondition
    if edit is None and 'report' in _QUALIFICATION:
        return _QUALIFICATION['report']
    locations = json.loads(LOCATIONS.read_bytes())['whole_resource_locations']
    pre = OriginalPrecondition('goal_certified_event_coordinator_contracts', locations)
    if edit is not None:
        edit(pre)
    report = pre.run()
    if edit is None:
        _QUALIFICATION['report'] = report
    return report


class ProfileOwner(A.TestOwner):
    """Installed descriptor selection and resource closure before any birth (CF-04)."""
    role = 'profile'
    custody_codec = 'exact_json'

    def __init__(self, registry, world, *, descriptor_path=COORD_PKG + 'installed-profile.json',
                 digest_path=COORD_PKG + 'installed-profile-digest.txt', member_edit=None, precondition_edit=None,
                 digest_recipe='compact', realm_edit=None, **kw):
        super().__init__(registry, **kw)
        self.realm_edit = realm_edit
        self.world = world
        self.descriptor_path = descriptor_path
        self.digest_path = digest_path
        self.member_edit = member_edit
        self.precondition_edit = precondition_edit
        self.digest_recipe = digest_recipe

    def select(self):
        with self.recorder.call(self.owner_id, 'select_installed_profile') as slot:
            raw = (ROOT / self.descriptor_path).read_bytes()
            descriptor = json.loads(raw)
            if self.member_edit:
                descriptor = self.member_edit(copy.deepcopy(descriptor))
            require('profile/writer_contract', descriptor.get('profile') == 'pm.executor.workflow_source.all_writers.v7')
            require('profile/predecessor', descriptor.get('predecessor_native_profile') ==
                    'pm.executor.workflow_source.all_writers.v6')
            members = descriptor['members']
            paths = [m['path'] for m in members]
            require('profile/member_duplicate', len(paths) == len(set(paths)))
            for member in members:
                path = ROOT / member['path']
                require('profile/member_missing', path.exists())
                blob = path.read_bytes()
                require('profile/member_hash', sha(blob) == member['sha256'])
                require('profile/member_bytes', len(blob) == member['bytes'])
            # Acyclic DAG: no member hashes the enclosing descriptor or its digest.
            require('profile/cycle', self.descriptor_path not in paths and self.digest_path not in paths)
            # Producer subprofile digest from its whole compact preimage, itself a member.
            sub_path = PRODUCER_PKG + 'native-v7/installed-profile.json'
            require('profile/subprofile_member', sub_path in paths)
            sub = json.loads((ROOT / sub_path).read_bytes())
            sub_digest = sha(json.dumps(sub, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('utf-8'))
            require('profile/subprofile_digest', sub_digest == descriptor['producer_source_profile_digest'] ==
                    (ROOT / PRODUCER_PKG / 'native-v7/installed-profile-digest.txt').read_text().strip())
            predecessor_path = ROOT / NATIVE_PKG / ('preinstallation-originals/' + str(
                descriptor['predecessor_native_profile_whole_sha256']) + '/installed-profile.json')
            require('profile/predecessor_bytes', predecessor_path.exists())
            predecessor = predecessor_path.read_bytes()
            require('profile/predecessor_bytes', sha(predecessor) == descriptor['predecessor_native_profile_whole_sha256'])
            if self.digest_recipe == 'compact':
                digest = sha(json.dumps(descriptor, sort_keys=True, separators=(',', ':'),
                                        ensure_ascii=False).encode('utf-8'))
            else:
                digest = sha(raw)
            recorded = (ROOT / self.digest_path).read_text().strip()
            require('profile/digest', digest == recorded)
            # Eager resolution of every realm, including the scoped Handoff route.
            realms = json.loads((ROOT / COORD_PKG / 'resource-realms.json').read_bytes())
            if self.realm_edit:
                realms = self.realm_edit(realms)
            for realm_name, declaration in realms.items():
                require('profile/realm_merge', declaration.get('merge_with_other_realms', False) is False)
                require('profile/network_fallback', declaration.get('network_fallback', False) is False)
            try:
                report = qualification(self.precondition_edit)
            except ValueError as error:
                raise Refusal('profile/resource_closure/' + str(error).split(':')[0].replace(' ', '_'))
            require('profile/unresolved', report['status'] == 'SCHEMA_REFERENCES_RESOLVED' and
                    not report['unresolved_occurrences'])
            record = dict(qualification=QUALIFICATION, recipe_id=D.RECIPE['recipe_id'], profile=descriptor['profile'],
                          profile_sha256=digest, producer_source_profile_digest=sub_digest,
                          member_count=len(members), reference_occurrences=report['reference_occurrences'],
                          explicit_cross_realm_occurrences=report['explicit_cross_realm_occurrences'],
                          descriptor_bytes_sha256=sha(raw), descriptor_compact_bytes=b64(json.dumps(
                              descriptor, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('utf-8')))
            handle = self._issue(None, record, kind='installed_descriptor')
            slot.set(dict(profile_sha256=digest))
            return handle


# ------------------------------------------------------------------ Goal owner

class GoalOwner(IssuingOwner):
    """Goal body/control/binding in its own store; issues whole Goal-realm arguments."""
    role = 'goal'

    def key(self, goal_id):
        return 'goal:' + S.k_component(goal_id)

    def seed(self, v):
        st = self.world.goal_store
        st.transact([
            dict(table=T_GOAL_BODY, key=self.key(v['goal_id']), expected=None,
                 value=dict(qualification=QUALIFICATION, goal_id=v['goal_id'], project_id=v['project_id'],
                            thread_id=v['thread_id'], goal_revision=v['goal_revision'], state='active')),
            dict(table=T_GOAL_CONTROL, key=self.key(v['goal_id']), expected=None,
                 value=dict(qualification=QUALIFICATION, goal_id=v['goal_id'], stop_state='none', stop_epoch=0,
                            control_revision=1)),
            dict(table=T_GOAL_BINDING, key=self.key(v['goal_id']), expected=None,
                 value=dict(qualification=QUALIFICATION, goal_id=v['goal_id'], bound_goal_run_id=v['goal_run_id'],
                            binding_epoch=1, workgraph_id=v['workgraph_id']))])

    def current(self, goal_id):
        st = self.world.goal_store
        body = st.cell(T_GOAL_BODY, self.key(goal_id))
        control = st.cell(T_GOAL_CONTROL, self.key(goal_id))
        binding = st.cell(T_GOAL_BINDING, self.key(goal_id))
        require('goal/unavailable', body is not None and control is not None and binding is not None)
        return body, control, binding

    def stop(self, goal_id):
        st = self.world.goal_store
        cell = st.cell(T_GOAL_CONTROL, self.key(goal_id))
        return st.transact([dict(table=T_GOAL_CONTROL, key=self.key(goal_id), expected=cell['version'],
                                 value=dict(cell['value'], stop_state='accepted',
                                            stop_epoch=cell['value']['stop_epoch'] + 1))])

    def edit(self, goal_id, **changes):
        st = self.world.goal_store
        cell = st.cell(T_GOAL_BODY, self.key(goal_id))
        return st.transact([dict(table=T_GOAL_BODY, key=self.key(goal_id), expected=cell['version'],
                                 value=dict(cell['value'], **changes))])

    def rebind(self, goal_id, run):
        st = self.world.goal_store
        cell = st.cell(T_GOAL_BINDING, self.key(goal_id))
        return st.transact([dict(table=T_GOAL_BINDING, key=self.key(goal_id), expected=cell['version'],
                                 value=dict(cell['value'], bound_goal_run_id=run,
                                            binding_epoch=cell['value']['binding_epoch'] + 1))])

    def argument(self, name, goal_id):
        """Acquire a whole Goal-realm argument (CurrentGoalArgument/BirthGoalArgument/BindingLowerArgument)."""
        w = self.world
        with self.recorder.call(self.owner_id, 'issue_goal_argument:' + name) as slot:
            body, control, binding = self.current(goal_id)
            realm, uri = ROOTS[name]
            ctx = C.Context(clock=w.storage.now, rng=w.rng, owner_tag=self.owner_id)
            value = C.compose(realm, uri, ctx, validate=False)
            b, c, g = body['value'], control['value'], binding['value']
            for field, val in (('goal_id', b['goal_id']), ('project_id', b['project_id']),
                               ('storage_instance_id', w.storage.storage_instance_id)):
                put_all(value, field, val)
            put_all(value, 'goal_run_id', g['bound_goal_run_id'])
            for p in glob_paths(value, '*goal_revision'):
                if isinstance(get(value, p), int):
                    put(value, p, b['goal_revision'])
            rvalidate(name, value, 'goal/' + name)
            record = dict(argument=value, goal_body_version=body['version'], goal_control_version=control['version'],
                          goal_binding_version=binding['version'], stop_state=c['stop_state'],
                          stop_epoch=c['stop_epoch'], bound_goal_run_id=g['bound_goal_run_id'],
                          goal_revision=b['goal_revision'], thread_id=b['thread_id'])
            handle = self._issue(None, record, kind=name)
            slot.set(dict(sha256=hsj(value)))
            return handle


# ------------------------------------------------------------------ CF-05 birth

class BirthCoordinator(A.TestOwner):
    """owner.executor.certified_event.enroll_fresh_birth.v1 (B1)."""
    role = 'birth_coordinator'

    def __init__(self, registry, world, **kw):
        super().__init__(registry, **kw)
        self.world = world

    def enroll(self, scope, *, profile, goal_handles, edits=None):
        w = self.world
        edits = edits or {}
        m = method('owner.executor.certified_event.enroll_fresh_birth.v1')
        with self.recorder.call(self.owner_id, m['method']) as slot:
            _, descriptor = A.acquire(w.registry, profile[0], 'profile', profile[1])
            got = {}
            for name, (owner_id, handle) in goal_handles.items():
                got[name] = A.acquire(w.registry, owner_id, 'goal', handle)[1]
            require('birth/future_input', set(got) == {'BirthGoalArgument', 'BindingLowerArgument'})
            bga, bla = got['BirthGoalArgument'], got['BindingLowerArgument']
            require('birth/profile', descriptor['profile_sha256'] == w.expected_profile_digest)
            require('birth/goal_run', bga['bound_goal_run_id'] == scope['goal_run_id'])
            require('birth/binding_run', bla['bound_goal_run_id'] == scope['goal_run_id'])
            require('birth/goal_stop', bga['stop_state'] == 'none')
            rvalidate('BirthGoalArgument', bga['argument'], 'birth/goal_argument')
            rvalidate('BindingLowerArgument', bla['argument'], 'birth/binding_argument')
            request = dict(scope=w.coord_scope(scope), owner=dict(owner_id=self.owner_id, owner_epoch=self.owner_epoch,
                                                                  operation_id='TEST_ONLY:operation:birth'),
                           installed_profile_sha256=descriptor['profile_sha256'])
            request = edits.get('request', lambda r: r)(request)
            rvalidate('BirthRequest', request, 'birth/request')
            require('birth/request_profile', request['installed_profile_sha256'] == descriptor['profile_sha256'])
            # 0. Whole original native birth argument from the native owner's unborn state (native realm).
            oba = w.native.original_birth_argument(scope, descriptor)
            oba = edits.get('birth_argument', lambda r: r)(oba)
            rvalidate('OriginalBirthArgument', oba, 'birth/original_birth_argument')
            require('birth/argument_run', all(v == scope['goal_run_id'] for p, v in nodes(oba)
                                              if p.endswith('goal_run_id') and isinstance(v, str)))
            # 1. Native birth candidate first (native owner derives it from its own unborn state).
            native = w.native.birth_candidate(scope, descriptor)
            native = edits.get('native', lambda r: r)(native)
            native_raw = A.canonical(native, 'birth/native_bytes')
            # 2. Birth selects the native birth; it records only the future control key / epoch 0 / empty phase.
            birth_key = w.coord_key('birth', scope)
            control_key = w.coord_key('control', scope)
            issued_at = w.storage.now()
            birth = dict(scope=request['scope'], owner=request['owner'], profile_sha256=descriptor['profile_sha256'],
                         original_native_birth=dict(key=w.native.birth_key(scope), sha256=sha(native_raw)),
                         initial_control_key=control_key, initial_control_epoch=0, initial_phase='empty',
                         issued_at_utc=issued_at, transaction_id='TEST_ONLY:pending')
            birth = edits.get('birth', lambda r: r)(birth)
            # 3. Control selects the actual Birth.
            control = self.control_for(birth, edits)
            require('birth/writer_contract', native['writer_contract'] == 'pm.executor.workflow_source.all_writers.v7')
            require('birth/initial_control_key', birth['initial_control_key'] == control_key)
            require('birth/control_selects_birth', control['birth'] == dict(key=birth_key, sha256=sha(A.canonical(birth))))
            require('birth/initial_epoch', birth['initial_control_epoch'] == 0 == control['epoch'])
            require('birth/initial_phase', birth['initial_phase'] == 'empty' == control['phase'])
            require('birth/selects_native', birth['original_native_birth'] ==
                    dict(key=w.native.birth_key(scope), sha256=sha(A.canonical(native))))
            require('birth/profile_selected', birth['profile_sha256'] == descriptor['profile_sha256'] ==
                    native['installed_contract_digest'])
            rvalidate('BirthCandidates', dict(birth=birth, control=control), 'birth/candidates')
            # Final guard after every helper, immediately before the single commit.
            body, gcontrol, binding = w.goal.current(scope['goal_id'])
            require('birth_final/effective_stop', gcontrol['value']['stop_state'] == 'none')
            require('birth_final/binding', binding['value']['bound_goal_run_id'] == scope['goal_run_id'])
            require('birth_final/goal_revision', body['version'] == bga['goal_body_version'])
            require('birth_final/occupied', w.storage.cell(T_COORD_BIRTH, birth_key) is None and
                    w.storage.cell(T_COORD_CONTROL, control_key) is None and
                    w.storage.cell(T_BIRTH, w.native.birth_key(scope)) is None)
            before = w.storage.cell_generation
            tx_id_holder = {}

            def stamp(record):
                return dict(record, transaction_id=tx_id_holder['tx'])
            next_tx = 'TEST_ONLY:tx:%s:%d' % (w.storage.storage_instance_id, w.storage.tx_counter + 1)
            tx_id_holder['tx'] = next_tx
            birth_s = stamp(birth)
            control_s = dict(control, birth=dict(key=birth_key, sha256=sha(A.canonical(birth_s))))
            native_rows = w.native.birth_rows(scope, native)
            writes = native_rows + [
                dict(table=T_COORD_BIRTH, key=birth_key, expected=None,
                     value=dict(schema_id='pm.storage_value.goal_certified_event_birth.v1', schema_version='1.0.0',
                                record=birth_s)),
                dict(table=T_COORD_CONTROL, key=control_key, expected=None,
                     value=dict(schema_id='pm.storage_value.goal_certified_event_control.v1', schema_version='1.0.0',
                                record=control_s))]
            if edits.get('split_transaction'):
                w.storage.transact(native_rows)
                writes = writes[len(native_rows):]
            tx = w.storage.transact(writes)
            require('birth/one_transaction', tx['tx_id'] == next_tx and w.storage.cell_generation == before + 1)
            rvalidate('StorageBirth', w.storage.cell(T_COORD_BIRTH, birth_key)['value'], 'birth/stored_birth')
            rvalidate('StorageControl', w.storage.cell(T_COORD_CONTROL, control_key)['value'], 'birth/stored_control')
            publication = w.native.birth_publication(scope, native, tx['tx_id'])
            rvalidate('WorkflowBirthPublication', publication['whole'], 'birth/publication')
            slot.set(dict(birth=birth_s, control=control_s, tx=tx['tx_id']))
            return dict(birth=birth_s, control=control_s, native=native, tx=tx['tx_id'], publication=publication)

    def control_for(self, birth, edits):
        w = self.world
        control = dict(scope=birth['scope'], epoch=0, phase='empty', intent=None, event_phase=None, commit=None,
                       origin=None, release=None, birth=dict(key=w.coord_key('birth', None, birth['scope']),
                                                             sha256=sha(A.canonical(birth))))
        return edits.get('control', lambda r: r)(control)


# ------------------------------------------------------------------ CF-03 native owner

class NativeRunOwner(IssuingOwner):
    """Native Workflow/D01/WorkNode store and its original successful chain (TEST_ONLY)."""
    role = 'native'

    def k(self, scope):
        return S.k_component(scope['goal_run_id'])

    def birth_key(self, scope):
        return 'executor_workflow_birth.v8:' + self.k(scope)

    def birth_candidate(self, scope, descriptor):
        w = self.world
        require('native/unborn', w.storage.cell(T_BODY, self.k(scope)) is None)
        return dict(qualification=QUALIFICATION, goal_run_id=scope['goal_run_id'], goal_id=scope['goal_id'],
                    project_id=scope['project_id'], workgraph_id=scope['workgraph_id'],
                    writer_contract='pm.executor.workflow_source.all_writers.v7',
                    installed_contract_digest=descriptor['profile_sha256'], status='ready', body_revision=1,
                    required_worknodes=list(w.values['worknodes']), born_at_utc=w.storage.now())

    def birth_rows(self, scope, native):
        k = self.k(scope)
        body = dict(qualification=QUALIFICATION, goal_run_id=native['goal_run_id'], goal_id=native['goal_id'],
                    project_id=native['project_id'], workgraph_id=native['workgraph_id'], status='ready',
                    body_revision=1, certification_receipt=None, required_worknodes=native['required_worknodes'],
                    writer_contract=native['writer_contract'])
        rows = [dict(table=T_BIRTH, key=self.birth_key(scope), expected=None, value=native),
                dict(table=T_BODY, key=k, expected=None, value=body),
                dict(table=T_CONTROL, key=k, expected=None, value=dict(control_revision=1, body_sha256=hsj(body))),
                dict(table=T_HEAD, key=k, expected=None, value=dict(revision=1, body_revision=1, body_sha256=hsj(body),
                                                                    last_update=None)),
                dict(table=T_ORIGIN, key=k + ':1', expected=None,
                     value=dict(rule='fresh_profile_birth', body_revision=1, issuer=self.owner_id))]
        for wn in native['required_worknodes']:
            rows.append(dict(table=T_WORKNODE, key=k + ':' + S.k_component(wn), expected=None,
                             value=dict(worknode_id=wn, lifecycle='queued', attempt_id=None, receipt_id=None,
                                        revision=1, required=True)))
        return rows

    def _whole(self, name, scope, extra=None, min_items=None):
        w = self.world
        realm, uri = ROOTS[name]
        ctx = C.Context(clock=w.storage.now, rng=random.Random(hsj([scope, name])), owner_tag=self.owner_id)
        ctx.min_items = min_items or {}
        value = C.compose(realm, uri, ctx, validate=False)
        for field, val in (('project_id', scope['project_id']), ('goal_id', scope['goal_id']),
                           ('goal_run_id', scope['goal_run_id']), ('storage_instance_id', w.storage.storage_instance_id),
                           ('workgraph_id', scope['workgraph_id'])):
            put_all(value, field, val)
        for key, val in (extra or {}).items():
            put_all(value, key, val)
        return value

    def original_birth_argument(self, scope, descriptor):
        require('native/unborn', self.world.storage.cell(T_BODY, self.k(scope)) is None)
        return self._whole('OriginalBirthArgument', scope)

    def birth_publication(self, scope, native, tx_id):
        whole = self._whole('WorkflowBirthPublication', scope)
        return dict(native_birth_sha256=sha(A.canonical(native)), transaction_id=tx_id, whole=whole)

    # -- native publications: one Storage transaction each, with D01 update/head/origin
    def _publish(self, scope, rule, body_changes, extra=(), *, require_status=None):
        w = self.world
        k = self.k(scope)
        body = w.storage.cell(T_BODY, k)
        control = w.storage.cell(T_CONTROL, k)
        head = w.storage.cell(T_HEAD, k)
        require('native/unborn', body is not None)
        if require_status is not None:
            require('native/status/' + rule, body['value']['status'] in require_status)
        after = dict(body['value'], **body_changes)
        after['body_revision'] = NR.uint64(body['value']['body_revision'] + 1, 'native/body_revision')
        rev = after['body_revision']
        writes = [dict(table=T_BODY, key=k, expected=body['version'], value=after),
                  dict(table=T_CONTROL, key=k, expected=control['version'],
                       value=dict(control_revision=control['value']['control_revision'] + 1, body_sha256=hsj(after))),
                  dict(table=T_HEAD, key=k, expected=head['version'],
                       value=dict(revision=head['value']['revision'] + 1, body_revision=rev, body_sha256=hsj(after),
                                  last_update='%s:%d' % (k, rev))),
                  dict(table=T_UPDATE, key='%s:%d' % (k, rev), expected=None,
                       value=dict(rule=rule, before_body_revision=rev - 1, after_body_revision=rev,
                                  before_status=body['value']['status'], after_status=after['status'])),
                  dict(table=T_ORIGIN, key='%s:%d' % (k, rev), expected=None,
                       value=dict(rule=rule, body_revision=rev, issuer=self.owner_id))]
        writes.extend(extra)
        with self.recorder.call(self.owner_id, 'native_publish:' + rule):
            return w.storage.transact(writes)

    def start(self, scope):
        return self._publish(scope, 'original_start_activation', dict(status='running'), require_status=('ready',))

    def worknode(self, scope, wn):
        return self.world.storage.cell(T_WORKNODE, self.k(scope) + ':' + S.k_component(wn))

    def _wn_step(self, scope, wn, expect, to, extra_fields, extra_rows=()):
        w = self.world
        cell = self.worknode(scope, wn)
        require('native/worknode_unknown', cell is not None)
        require('native/worknode_state/' + to, cell['value']['lifecycle'] == expect)
        value = dict(cell['value'], lifecycle=to, revision=cell['value']['revision'], **extra_fields)
        writes = [dict(table=T_WORKNODE, key=self.k(scope) + ':' + S.k_component(wn), expected=cell['version'],
                       value=value)] + list(extra_rows)
        with self.recorder.call(self.owner_id, 'native_worknode:%s->%s' % (expect, to)):
            return w.storage.transact(writes)

    def run_worknode(self, scope, wn, *, validator_outcome='passed', auditor='certified', fail_at=None):
        w = self.world
        k = self.k(scope)
        attempt = 'TEST_ONLY:attempt:%s:1' % wn
        self._wn_step(scope, wn, 'queued', 'in_progress', dict(attempt_id=attempt),
                      [dict(table=T_ATTEMPT, key=k + ':' + S.k_component(attempt), expected=None,
                            value=dict(attempt_id=attempt, worknode_id=wn, number=1, cause='initial',
                                       started_at_utc=w.storage.now(), terminal_result=None))])
        if fail_at == 'in_progress':
            return
        self._wn_step(scope, wn, 'in_progress', 'verify_pending', {})
        validator_id = 'TEST_ONLY:validator:%s' % wn
        self._wn_step(scope, wn, 'verify_pending', 'verified' if validator_outcome == 'passed' else 'failed', {},
                      [dict(table=T_VALIDATOR, key=k + ':' + S.k_component(validator_id), expected=None,
                            value=dict(validator_id=validator_id, worknode_id=wn, outcome=validator_outcome,
                                       evidence_ref='TEST_ONLY:evidence:%s' % wn))])
        if validator_outcome != 'passed' or fail_at == 'verified':
            return
        receipt = 'TEST_ONLY:worknode-receipt:%s' % wn
        audit_id = 'TEST_ONLY:auditor:%s' % wn
        self._wn_step(scope, wn, 'verified', 'done', dict(receipt_id=receipt),
                      [dict(table=T_AUDITOR, key=k + ':' + S.k_component(audit_id), expected=None,
                            value=dict(receipt_id=audit_id, worknode_id=wn, terminal_state=auditor,
                                       certified=auditor == 'certified', unresolved_findings=[]))])
        self._publish(scope, 'original_execution_progress', {}, require_status=('running',))

    def add_criterion(self, scope, criterion_id, outcome, required=True):
        k = self.k(scope)
        return self.world.storage.transact([dict(table=T_CRITERION, key=k + ':' + S.k_component(criterion_id),
                                                 expected=None, value=dict(criterion_id=criterion_id, outcome=outcome,
                                                                           required=required,
                                                                           evidence_refs=['TEST_ONLY:evidence:c'] if
                                                                           outcome == 'satisfied' else []))])

    def add_artifact(self, scope, path, byte_count, chars, docset=None):
        k = self.k(scope)
        rows = [dict(table=T_ARTIFACT, key=k + ':' + S.k_component(path), expected=None,
                     value=dict(path=path, byte_count=byte_count, character_count=chars))]
        if docset is not None:
            rows.append(dict(table=T_DOCSET, key=k + ':' + S.k_component(path), expected=None, value=docset))
        return self.world.storage.transact(rows)

    def add_blocker(self, scope, blocker_id):
        k = self.k(scope)
        return self.world.storage.transact([dict(table=T_BLOCKER, key=k + ':' + S.k_component(blocker_id),
                                                 expected=None, value=dict(blocker_id=blocker_id, active=True))])

    def set_source_control(self, scope, state, rollback='not_required', safe_point='not_required'):
        k = self.k(scope)
        cell = self.world.storage.cell(T_SOURCE_CONTROL, k)
        return self.world.storage.transact([dict(table=T_SOURCE_CONTROL, key=k,
                                                 expected=None if cell is None else cell['version'],
                                                 value=dict(final_source_state=state, rollback_policy=rollback,
                                                            safe_point_policy=safe_point))])

    def provisional_success(self, scope):
        state = self.state(scope)
        for wn in state['body']['required_worknodes']:
            require('native/provisional/required_worknode', state['worknodes'].get(wn, {}).get('lifecycle') == 'done')
        return self._publish(scope, 'original_provisional_success', dict(status='provisional_success'),
                             require_status=('running',))

    def set_verifying(self, scope):
        return self._publish(scope, 'original_verifying', dict(status='verifying'),
                             require_status=('provisional_success',))

    def advance_after(self, scope):
        """A later native progress publication (stale-source negative)."""
        return self._publish(scope, 'original_execution_progress', {}, require_status=None)

    def state(self, scope):
        """Fresh complete native state from the store (all tables of this run)."""
        w = self.world
        k = self.k(scope)
        cells = w.storage.cells

        def rows(table):
            return {key: c['value'] for key, c in cells.get(table, {}).items() if key.startswith(k + ':')}
        body = w.storage.cell(T_BODY, k)
        require('native/unborn', body is not None)
        return dict(body=body['value'], body_version=body['version'], body_tx=body['tx'],
                    control=w.storage.cell(T_CONTROL, k)['value'], head=w.storage.cell(T_HEAD, k)['value'],
                    head_version=w.storage.cell(T_HEAD, k)['version'],
                    birth=w.storage.cell(T_BIRTH, self.birth_key(scope))['value'],
                    worknodes={v['worknode_id']: v for v in rows(T_WORKNODE).values()},
                    attempts=rows(T_ATTEMPT), validators=rows(T_VALIDATOR), auditors=rows(T_AUDITOR),
                    criteria={v['criterion_id']: v for v in rows(T_CRITERION).values()},
                    blockers=[v for v in rows(T_BLOCKER).values() if v['active']],
                    artifacts=rows(T_ARTIFACT), docsets=rows(T_DOCSET),
                    updates=rows(T_UPDATE), origins=rows(T_ORIGIN), native_owner=self.owner_id,
                    source_control=(w.storage.cell(T_SOURCE_CONTROL, k) or {}).get('value'))

    # -- whole roots acquired over the native store
    def compose_source(self, scope, state, decision):
        """OriginalCertificationSource (whole, native realm) from the native store."""
        w = self.world
        realm, uri = ROOTS['OriginalCertificationSource']
        ctx = C.Context(clock=w.storage.now, rng=random.Random(hsj([scope, state['body_version']])),
                        owner_tag=self.owner_id)
        ctx.min_items = {'gates/required_criterion_evaluations': 1, 'gates/required_auditor_verifications': 1,
                         'gates/all_required_worknodes': 1, 'current/all_native_current': 1,
                         'current/requirements/required_set/record/members': 1,
                         'current/requirements/installed_graph/record/members': 1}
        value = C.compose(realm, uri, ctx, validate=False)
        self._project(value, scope, state, decision, 'current', 'gates')
        rvalidate('OriginalCertificationSource', value, 'native/original_certification_source')
        return value

    def compose_current(self, scope, state):
        w = self.world
        realm, uri = ROOTS['CurrentWorkflowSource']
        ctx = C.Context(clock=w.storage.now, rng=random.Random(hsj([scope, state['body_version'], 'current'])),
                        owner_tag=self.owner_id)
        ctx.min_items = {'all_native_current': 1, 'requirements/required_set/record/members': 1,
                         'requirements/installed_graph/record/members': 1}
        value = dict(current=C.compose(realm, uri, ctx, validate=False))
        self._project(value, scope, state, None, 'current', None)
        rvalidate('CurrentWorkflowSource', value['current'], 'native/current_workflow_source')
        return value['current']

    def _project(self, value, scope, state, decision, cur, gates):
        w = self.world
        for field, val in (('project_id', scope['project_id']), ('goal_id', scope['goal_id']),
                           ('goal_run_id', scope['goal_run_id']), ('storage_instance_id', w.storage.storage_instance_id),
                           ('workgraph_id', scope['workgraph_id'])):
            put_all(value, field, val)
        body = state['body']
        wf = cur + '/original_start/d01_current/workflow/'
        put(value, wf + 'current_body/status', body['status'])
        put(value, wf + 'current_body/revision', body['body_revision'])
        put(value, wf + 'current_body/certification_receipt', body['certification_receipt'])
        put(value, wf + 'head/revision', state['head']['revision'])
        required = list(body['required_worknodes'])

        def member(wn):
            def edit(item):
                item['worknode_id'] = wn
            return edit
        expand(value, cur + '/requirements/required_set/record/members', [member(wn) for wn in required])
        expand(value, cur + '/requirements/installed_graph/record/members', [member(wn) for wn in required])

        def native_current(wn):
            def edit(item):
                record = state['worknodes'][wn]
                item['current']['worknode']['worknode_id'] = wn
                item['current']['worknode']['lifecycle'] = record['lifecycle']
                item['current']['scope']['worknode_id'] = wn
            return edit
        expand(value, cur + '/all_native_current', [native_current(wn) for wn in sorted(state['worknodes'])])
        if gates is None:
            return
        g = gates + '/'

        def completion(wn):
            def edit(item):
                record = state['worknodes'][wn]
                item['original_native_completion']['current']['worknode']['worknode_id'] = wn
                item['original_native_completion']['current']['worknode']['lifecycle'] = record['lifecycle']
                item['original_completion_inputs']['attempt_id'] = record['attempt_id'] or 'TEST_ONLY:none'
            return edit
        expand(value, g + 'all_required_worknodes', [completion(wn) for wn in required])

        def criterion(cid):
            def edit(item):
                record = state['criteria'][cid]
                for key in ('criterion_id', 'outcome', 'evaluation'):
                    if key in item and isinstance(item[key], str):
                        item[key] = record['criterion_id'] if key == 'criterion_id' else item[key]
                item['_TEST_ONLY_outcome'] = record['outcome']
            return edit
        crits = sorted(c for c, r in state['criteria'].items() if r['required'])
        if crits:
            expand(value, g + 'required_criterion_evaluations', [criterion(c) for c in crits])
            for item, cid in zip(get(value, g + 'required_criterion_evaluations'), crits):
                item.pop('_TEST_ONLY_outcome', None)

        def auditor(record):
            def edit(item):
                item['receipt_id'] = record['receipt_id']
                item['worknode_ref'] = record['worknode_id']
                item['terminal_state'] = record['terminal_state']
                item['certified'] = record['certified']
            return edit
        auds = [state['auditors'][k2] for k2 in sorted(state['auditors'])]
        if auds:
            expand(value, g + 'required_auditor_verifications', [auditor(a) for a in auds])
        if decision is not None:
            receipt = decision['receipt']
            for key, val in receipt.items():
                if key in get(value, 'original_final_decision/complete_receipt'):
                    put(value, 'original_final_decision/complete_receipt/' + key, copy.deepcopy(val))
            put(value, 'original_final_decision/original_source_argument_sha256', decision['source_argument_sha256'])
            put(value, 'original_final_decision/original_goal_argument_sha256', decision['goal_argument_sha256'])
            ident = get(value, 'original_final_decision/original_identity')
            ident.update(owner_ref=decision['owner_ref'], operation_id=decision['operation_id'],
                         transaction_id=decision['transaction_id'], source_sha256=decision['receipt_sha256'],
                         source_codec='pm.goal.certification_source_json.v1', issued_at_utc=decision['issued_at_utc'])

    def prepare_certified(self, scope, *, standard, decision_check):
        """owner.workflow.standard.prepare_certified.v1: whole CertificationCandidateResult."""
        w = self.world
        with self.recorder.call(self.owner_id, 'prepare_certified') as slot:
            state = self.state(scope)
            decision_check(state)
            body = state['body']
            require('prepare/status', body['status'] in ('provisional_success', 'verifying'))
            after = dict(body, status='certified', certification_receipt=standard['receipt_ref'],
                         body_revision=NR.uint64(body['body_revision'] + 1, 'prepare/revision'))
            realm, uri = ROOTS['CertificationCandidateResult']
            ctx = C.Context(clock=w.storage.now, rng=random.Random(hsj([scope, 'candidate', state['body_version']])),
                            owner_tag=self.owner_id)
            value = C.compose(realm, uri, ctx, validate=False)
            for field, val in (('project_id', scope['project_id']), ('goal_id', scope['goal_id']),
                               ('goal_run_id', scope['goal_run_id']),
                               ('storage_instance_id', w.storage.storage_instance_id)):
                put_all(value, field, val)
            rvalidate('CertificationCandidateResult', value, 'prepare/candidate')
            candidate = dict(whole=value, before=body, after=after, rule='original_standard_certification',
                             cause='completion_certification', before_revision=body['body_revision'],
                             after_revision=after['body_revision'], action_authority='none',
                             head_revision=state['head']['revision'])
            handle = self._issue(None, candidate, kind='certification_candidate')
            slot.set(dict(after_revision=after['body_revision']))
            return handle


# ------------------------------------------------------------------ gates and final decision

def evaluate_gates(state, code='g'):
    """G1-G8 plus Document Packaging, independently from the complete native state."""
    body = state['body']
    required = list(body['required_worknodes'])
    require(code + '1/required_set', len(required) >= 1 and len(set(required)) == len(required))
    for wn in required:
        rec = state['worknodes'].get(wn)
        require(code + '1/all_worknodes_terminal', rec is not None and rec['lifecycle'] == 'done' and
                rec['receipt_id'] is not None and rec['attempt_id'] is not None)
    require(code + '1/inventory', set(state['worknodes']) >= set(required))
    crits = [c for c in state['criteria'].values() if c['required']]
    require(code + '2/criteria_present', len(crits) >= 1)
    for c in crits:
        require(code + '2/criterion_satisfied', c['outcome'] == 'satisfied' and len(c['evidence_refs']) >= 1)
    for v in state['validators'].values():
        if v['worknode_id'] in required:
            require(code + '2/validator_passed', v['outcome'] == 'passed')
    sc = state['source_control']
    require(code + '3/source_control_present', sc is not None)
    require(code + '3/final_source_state', sc['final_source_state'] in ('clean', 'intentionally_preserved'))
    require(code + '4/no_active_blockers', not state['blockers'])
    require(code + '5/rollback', sc['rollback_policy'] in ('not_required', 'completed'))
    require(code + '6/safe_point', sc['safe_point_policy'] in ('not_required', 'resolved'))
    require(code + '7/currentness', state['head']['body_revision'] == body['body_revision'] and
            state['head']['body_sha256'] == hsj(body))
    for key, update in state['updates'].items():
        origin = state['origins'].get(key)
        require(code + 'u2/d01_origin', origin is not None and origin['rule'] == update['rule'] and
                origin['issuer'] == state['native_owner'] and origin['body_revision'] == update['after_body_revision'])
    auds = {a['worknode_id']: a for a in state['auditors'].values()}
    for wn in required:
        a = auds.get(wn)
        require(code + '8/auditor_passed', a is not None and a['certified'] is True and
                a['terminal_state'] == 'certified' and not a['unresolved_findings'])
    for key, art in state['artifacts'].items():
        trig = art['path'].startswith('.puppet-master/') and (art['byte_count'] >= DOC_BYTES or
                                                               art['character_count'] // 4 >= DOC_TOKENS)
        if trig:
            ds = state['docsets'].get(key)
            require(code + 'doc/document_set', ds is not None and sorted(ds.get('audits', [])) == ['A', 'B', 'C'] and
                    ds.get('status') == 'pass' and ds.get('source_byte_count') == art['byte_count'])
    return True


class FinalDecisionOwner(IssuingOwner):
    """owner.workflow.standard.issue_final_decision.v1 (G1-G8 from native state)."""
    role = 'final_decision'

    def issue(self, scope, goal_handle, *, receipt_edit=None, decision='certified'):
        w = self.world
        with self.recorder.call(self.owner_id, 'issue_final_decision') as slot:
            state = w.native.state(scope)
            require('final/status', state['body']['status'] in ('provisional_success', 'verifying'))
            _, goal = A.acquire(w.registry, goal_handle[0], 'goal', goal_handle[1])
            require('final/goal_stop', goal['stop_state'] == 'none')
            body, control, binding = w.goal.current(scope['goal_id'])
            require('final/goal_current', control['value']['stop_state'] == 'none' and
                    body['version'] == goal['goal_body_version'] and
                    binding['value']['bound_goal_run_id'] == scope['goal_run_id'])
            evaluate_gates(state, 'final/g')
            required = list(state['body']['required_worknodes'])
            receipt = dict(receipt_id='TEST_ONLY:final-receipt:%s' % S.k_component(scope['goal_run_id']),
                           all_worknodes_terminal=True, all_tests_passed_or_dispositioned=True,
                           source_control_receipts_valid=True, no_active_blockers=True,
                           rollback_requirements_satisfied=True, safe_point_requirements_satisfied=True,
                           no_stale_plan_workgraph_currentness_mismatch=True, auditor_passed=True,
                           final_source_state=state['source_control']['final_source_state'],
                           final_certifier_decision=decision, child_receipt_refs=[],
                           worknode_receipt_refs=[state['worknodes'][wn]['receipt_id'] for wn in required],
                           unresolved_risks=[])
            if receipt_edit:
                receipt = receipt_edit(receipt)
            source_argument = dict(body=state['body'], head=state['head'], worknodes=state['worknodes'],
                                   criteria=state['criteria'], auditors=state['auditors'])
            issued_at = w.storage.now()
            op = self.next_op('final_decision')
            tx = w.storage.transact([dict(table=T_DECISION, key=w.native.k(scope), expected=None,
                                          value=dict(receipt_sha256=hsj(receipt), operation_id=op,
                                                     body_revision=state['body']['body_revision'],
                                                     decision=receipt['final_certifier_decision']))])
            record = dict(receipt=receipt, receipt_sha256=hsj(receipt), source_argument_sha256=hsj(source_argument),
                          goal_argument_sha256=hsj(goal['argument']), owner_ref=self.owner_id, operation_id=op,
                          transaction_id=tx['tx_id'], issued_at_utc=issued_at,
                          body_revision=state['body']['body_revision'])
            handle = self._issue(None, record, kind='final_decision_result')
            slot.set(dict(receipt_sha256=record['receipt_sha256']))
            return handle


def check_decision(world, scope, decision, code):
    """Every consumer re-derives the final decision's joins from current native state."""
    state = world.native.state(scope)
    row = world.storage.cell(T_DECISION, world.native.k(scope))
    require(code + '/decision_issued', row is not None and row['tx'] == decision['transaction_id'] and
            row['value']['receipt_sha256'] == decision['receipt_sha256'] == hsj(decision['receipt']))
    require(code + '/decision_current', row['value']['body_revision'] == state['body']['body_revision'] ==
            decision['body_revision'])
    receipt = decision['receipt']
    require(code + '/decision_certified', receipt['final_certifier_decision'] == 'certified')
    require(code + '/no_exception', not receipt['child_receipt_refs'] and not receipt['unresolved_risks'])
    required = state['body']['required_worknodes']
    require(code + '/worknode_receipts', receipt['worknode_receipt_refs'] ==
            [state['worknodes'][wn]['receipt_id'] for wn in required])
    for flag in ('all_worknodes_terminal', 'all_tests_passed_or_dispositioned', 'source_control_receipts_valid',
                 'no_active_blockers', 'rollback_requirements_satisfied', 'safe_point_requirements_satisfied',
                 'no_stale_plan_workgraph_currentness_mismatch', 'auditor_passed'):
        require(code + '/flag/' + flag, receipt[flag] is True)
    evaluate_gates(state, code + '/g')
    return state


class StandardOwner(IssuingOwner):
    """storage.goal_receipt.capture_standard.v2: whole DurableStandardRead after U/G."""
    role = 'standard'

    def capture(self, scope, decision_handle, goal_handle, *, decision_override=None):
        w = self.world
        with self.recorder.call(self.owner_id, 'capture_standard') as slot:
            _, decision = A.acquire(w.registry, decision_handle[0], 'final_decision', decision_handle[1])
            if decision_override:
                decision = decision_override(copy.deepcopy(decision))
            check_decision(w, scope, decision, 'standard')
            _, goal = A.acquire(w.registry, goal_handle[0], 'goal', goal_handle[1])
            require('standard/goal_stop', goal['stop_state'] == 'none')
            body, control, binding = w.goal.current(scope['goal_id'])
            require('standard/goal_current', control['value']['stop_state'] == 'none' and
                    body['version'] == goal['goal_body_version'] and
                    binding['value']['bound_goal_run_id'] == scope['goal_run_id'])
            realm, uri = ROOTS['DurableStandardRead']
            ctx = C.Context(clock=w.storage.now, rng=w.rng, owner_tag=self.owner_id)
            value = C.compose(realm, uri, ctx, validate=False)
            for field, val in (('project_id', scope['project_id']), ('goal_id', scope['goal_id']),
                               ('goal_run_id', scope['goal_run_id']),
                               ('storage_instance_id', w.storage.storage_instance_id)):
                put_all(value, field, val)
            rvalidate('DurableStandardRead', value, 'standard/durable_read')
            key = 'goal_receipt.v1:' + S.k_component(scope['project_id']) + ':' + S.k_component(
                decision['receipt']['receipt_id'])
            tx = w.storage.transact([
                dict(table=T_STANDARD, key=key, expected=None,
                     value=dict(goal_run_id=scope['goal_run_id'], decision=decision['receipt']['final_certifier_decision'],
                                receipt_sha256=decision['receipt_sha256'], whole_sha256=hsj(value))),
                dict(table=T_STANDARD_ORIGIN, key=key, expected=None,
                     value=dict(issuer=self.owner_id, decision_tx=decision['transaction_id']))])
            record = dict(whole=value, receipt_ref='TEST_ONLY:standard-receipt:' + tx['tx_id'], storage_key=key,
                          tx_id=tx['tx_id'], goal_run_id=scope['goal_run_id'],
                          final_certifier_decision=decision['receipt']['final_certifier_decision'],
                          decision_receipt_sha256=decision['receipt_sha256'])
            handle = self._issue(None, record, kind='durable_standard')
            slot.set(dict(receipt_ref=record['receipt_ref']))
            return handle

    def durable(self, record):
        cell = self.world.storage.cell(T_STANDARD, record['storage_key'])
        return cell is not None and cell.get('tx') == record['tx_id'] and \
            cell['value']['whole_sha256'] == hsj(record['whole'])


# ------------------------------------------------------------------ CF-02 producer-side owners

def _base_facts(world, scope):
    target = dict(project_id=scope['project_id'], goal_id=scope['goal_id'], goal_run_id=scope['goal_run_id'],
                  workgraph_id=scope['workgraph_id'], workgraph_revision=world.values['workgraph_revision'],
                  workgraph_sha256=world.values['workgraph_sha256'])
    return {'target': target}


class ProducerSideOwner(IssuingOwner):
    """Common issuance of a whole producer-realm root."""
    root_name = None
    kind = None

    def owner_binding(self, value, descriptor_sha):
        for path, node in nodes(value):
            if isinstance(node, dict) and 'registered_owner_role' in node and 'original_registration' in node:
                node.update(owner_ref=self.owner_id, owner_epoch=self.owner_epoch, registered_owner_role=self.role,
                            original_issuer_method='TEST_ONLY:%s.issue.v1' % self.role,
                            reader_method='TEST_ONLY:%s.read.v1' % self.role,
                            installed_profile_ref='pm.goal_run_certified.producer_source.v2',
                            installed_profile_sha256=descriptor_sha)

    def issue_root(self, scope, facts, *, edits=None, seal=True):
        w = self.world
        with self.recorder.call(self.owner_id, 'issue_original:' + self.root_name) as slot:
            realm, uri = ROOTS[self.root_name]
            f = _base_facts(w, scope)
            f.update(facts)
            ctx = C.Context(facts=f, clock=w.storage.now, rng=random.Random(hsj([self.owner_id, self.root_name])),
                            owner_tag=self.owner_id)
            value = C.compose(realm, uri, ctx, validate=False)
            embedded = {k[1:]: copy.deepcopy(val) for k, val in facts.items()
                        if k.startswith('=') and isinstance(val, dict)}
            self.owner_binding(value, w.expected_producer_digest)
            if seal:
                self.seal(value, tag=self.root_name, scope=dict(scope, thread_id=w.values['thread_id']))
            for key, val in embedded.items():
                put(value, key, val)  # another owner's whole root stays byte-exact
            if edits:
                value = edits(value)
            rvalidate(self.root_name, value, 'issue/' + self.root_name)
            handle = self._issue(None, value, kind=self.kind)
            slot.set(dict(sha256=hsj(value)))
            return handle


class AssignmentOwner(ProducerSideOwner):
    role = 'assignment'
    root_name = 'AssignmentSource'
    kind = 'assignment'

    def issue_for(self, scope, v, edits=None):
        w = self.world
        actor = v['actor_ref']
        tx = w.storage.transact([dict(table=T_ASSIGNMENT, key=S.k_component(scope['goal_run_id']),
                                      expected=None, value=dict(assignment_ref=v['assignment_ref'], revision=1,
                                                                actor_ref=actor, owner=self.owner_id))])
        facts = {'assigned_actor/actor_ref': actor, 'assigned_actor/execution_role': 'verifier',
                 'original_assignment_ref': v['assignment_ref'], 'original_assignment_revision': 1,
                 'execution_context/run_id': scope['goal_run_id'], 'execution_context/project_id': scope['project_id'],
                 'execution_context/operation_id': v['invocation_operation']}
        handle = self.issue_root(scope, facts, edits=edits)
        return handle, tx

    def supersede(self, scope):
        w = self.world
        cell = w.storage.cell(T_ASSIGNMENT, S.k_component(scope['goal_run_id']))
        return w.storage.transact([dict(table=T_ASSIGNMENT, key=S.k_component(scope['goal_run_id']),
                                        expected=cell['version'], value=dict(cell['value'], revision=2))])


class InvocationOwner(ProducerSideOwner):
    role = 'invocation'
    root_name = 'InvocationSource'
    kind = 'invocation'

    def issue_for(self, scope, v, assignment, edits=None):
        facts = {'=assignment': assignment, 'actual_actor/actor_ref': v['actor_ref'],
                 'actual_actor/execution_role': 'verifier', 'original_operation_id': v['invocation_operation'],
                 'execution_context/run_id': scope['goal_run_id'], 'execution_context/project_id': scope['project_id'],
                 'execution_context/operation_id': v['invocation_operation'],
                 'whole_invocation_request/invocation_id': v['invocation_id'],
                 'whole_invocation_result/invocation_id': v['invocation_id'],
                 'whole_invocation_result/assignment_id': v['assignment_ref'],
                 'whole_invocation_result/assignment_revision': 1,
                 'causal_source/correlation_id': v['correlation_id'],
                 'whole_producer_context/correlation_id': v['correlation_id']}
        return self.issue_root(scope, facts, edits=edits)


class ResolverOwner(ProducerSideOwner):
    role = 'resolver'
    root_name = 'ResolverGraphSource'
    kind = 'resolver'

    def issue_for(self, scope, v, edits=None):
        r = v['runtime']
        facts = {'original_invocation_id': v['invocation_id'],
                 'resolved_identity/requested_platform': r['requested_provider'],
                 'resolved_identity/effective_platform': r['effective_provider'],
                 'resolved_identity/requested_model': r['requested_model'],
                 'resolved_identity/effective_model': r['effective_model'],
                 'resolved_identity/execution_role': 'verifier'}
        return self.issue_root(scope, facts, edits=edits)


REFERENCE_ROLES = ('actor', 'requested_provider', 'effective_provider', 'requested_model', 'effective_model',
                   'requested_account', 'effective_account')


class ReferenceOwner(ProducerSideOwner):
    role = 'references'
    root_name = 'ReferenceSource'
    kind = 'references'

    def issue_for(self, scope, v, edits=None):
        r = v['runtime']
        refs = dict(actor=v['actor_ref'], requested_provider=r['requested_provider'],
                    effective_provider=r['effective_provider'], requested_model=r['requested_model'],
                    effective_model=r['effective_model'], requested_account=r['requested_account'],
                    effective_account=r['effective_account'])

        def bind(value):
            for b in value['bindings']:
                b['reference'] = refs[b['reference_role']]
                if isinstance(b.get('whole_reference_record'), dict) and 'reference_role' in b['whole_reference_record']:
                    b['whole_reference_record']['reference_role'] = b['reference_role']
            return edits(value) if edits else value
        return self.issue_root(scope, {'original_invocation_id': v['invocation_id']}, edits=bind)


class CausalOwner(ProducerSideOwner):
    role = 'causality'
    root_name = 'CausalSource'
    kind = 'causal'

    def issue_for(self, scope, v, edits=None):
        facts = {'correlation_id': v['correlation_id']}
        return self.issue_root(scope, facts, edits=edits)


class PartitionRouteOwner(ProducerSideOwner):
    """Storage-issued partition/route record as an OriginalStructuredValue."""
    role = 'storage_partition'
    root_name = 'OriginalStructuredValue'
    kind = 'partition_route'

    def issue_for(self, scope, recipe='base64url', storage=None):
        w = self.world
        st = storage or w.storage
        partition = S.scope_partition(dict(scope_kind='project', project_id=scope['project_id'])) \
            if recipe == 'base64url' else 'project~' + scope['project_id'].encode('utf-8').hex()
        route = dict(qualification=QUALIFICATION, storage_instance_id=st.storage_instance_id,
                     project_id=scope['project_id'], scope_partition=partition,
                     route='TEST_ONLY:route:goal_run.certified.v3')

        def put_record(value):
            value['_record'] = route
            return value
        realm, uri = ROOTS['OriginalStructuredValue']
        ctx = C.Context(clock=w.storage.now, rng=w.rng, owner_tag=self.owner_id)
        value = C.compose(realm, uri, ctx, validate=False)
        value['_record'] = route
        self.seal(value, tag='partition_route', scope=dict(scope, thread_id=w.values['thread_id']))
        value.pop('_record', None)
        rvalidate('OriginalStructuredValue', value, 'issue/partition_route')
        handle = self._issue(None, dict(whole=value, route=route), kind=self.kind)
        return handle


# ------------------------------------------------------------------ CF-01/CF-02 identity and producer

class WholeIdentityOwner(A.TestOwner):
    """owner.workflow.certified_event.derive_original_identity.v1 over whole roots (I0/I1)."""
    role = 'identity'
    custody_codec = 'exact_json'

    def __init__(self, registry, world, *, formula='certified_v3', realm_override=None, **kw):
        super().__init__(registry, **kw)
        self.world = world
        self.formula = formula
        self.realm_override = realm_override

    def derive(self, scope, handles, *, request_edit=None, input_edit=None, drift=None, future=None):
        w = self.world
        m = method('owner.workflow.certified_event.derive_original_identity.v1')
        with self.recorder.call(self.owner_id, m['method']) as slot:
            got = {}
            order = ['descriptor', 'native', 'goal', 'standard', 'assignment', 'invocation', 'resolver', 'references',
                     'causal', 'partition']
            roles = dict(descriptor='profile', native='native_source', goal='goal', standard='standard',
                         assignment='assignment', invocation='invocation', resolver='resolver', references='references',
                         causal='causality', partition='storage_partition')
            require('identity/future_input', future is None and set(handles) == set(order))
            for name in order:
                owner_id, handle = handles[name]
                got[name] = A.acquire(w.registry, owner_id, roles[name], handle)[1]
                if drift and drift.get('after') == name:
                    drift['apply'](w)
                self.helper_recheck(scope, got, name)
            descriptor = got['descriptor']
            require('identity/descriptor_unavailable', descriptor.get('recipe_id') == D.RECIPE['recipe_id'] and
                    descriptor['profile_sha256'] == w.expected_profile_digest)
            native, goal, standard = got['native'], got['goal'], got['standard']
            part = got['partition']
            # Whole roots in their realms (U1 / I0).
            rvalidate('OriginalCertificationSource', native['whole'], 'i0/original_certification_source')
            rvalidate('CurrentGoalArgument', goal['argument'], 'i0/current_goal')
            rvalidate('DurableStandardRead', standard['whole'], 'i0/durable_standard')
            for name, root in (('assignment', 'AssignmentSource'), ('invocation', 'InvocationSource'),
                               ('resolver', 'ResolverGraphSource'), ('references', 'ReferenceSource'),
                               ('causal', 'CausalSource')):
                rvalidate(root, got[name], 'i0/' + name)
                authenticate_structured(w, got[name], 'i0/' + name, scope)
            rvalidate('OriginalStructuredValue', part['whole'], 'i0/partition')
            authenticate_structured(w, part['whole'], 'i0/partition', scope)
            dispatch(w, m['method'], dict(original_certification_source=native['whole'], current_goal=goal['argument'],
                                          durable_standard=standard['whole'], assignment=got['assignment'],
                                          invocation=got['invocation'], resolver=got['resolver'],
                                          references=got['references'], causal=got['causal'],
                                          original_storage_partition_and_route=part['whole']),
                     realm_override=self.realm_override)
            self.joins(scope, got)
            before = NR.integer(native['body_revision'], 'identity/native_revision', minimum=0)
            route = json.loads(base64.b64decode(part['whole']['complete_value']['bytes_base64']))['content']
            input_ = dict(scope=dict(project_id=scope['project_id'], goal_id=scope['goal_id'],
                                     goal_run_id=scope['goal_run_id'], work_graph_id=scope['workgraph_id'],
                                     storage_instance_id=route['storage_instance_id'],
                                     scope_partition=route['scope_partition']),
                          recipe=copy.deepcopy(D.RECIPE),
                          original_storage_partition_owner=dict(owner_id=w.partition.owner_id,
                                                                owner_epoch=w.partition.owner_epoch,
                                                                operation_id=part['whole']['identity'][
                                                                    'original_operation_id']),
                          original_invocation_operation_id=w.values['invocation_operation'],
                          certification_receipt_ref=standard['receipt_ref'],
                          final_certifier_decision=native['decision']['receipt']['final_certifier_decision'],
                          expected_goal_run_revision=before, goal_run_revision=before + 1,
                          installed_profile_sha256=descriptor['profile_sha256'])
            if input_edit:
                input_ = input_edit(input_)
            request = dict(scope=w.coord_scope(scope),
                           owner=dict(owner_id=self.owner_id, owner_epoch=self.owner_epoch,
                                      operation_id='TEST_ONLY:operation:identity'),
                           expected_control_epoch=0, installed_profile_sha256=descriptor['profile_sha256'])
            if request_edit:
                request = request_edit(request)
            rvalidate('Request', request, 'identity/request')
            require('identity/request_scope', request['scope'] == w.coord_scope(scope))
            require('identity/request_profile', request['installed_profile_sha256'] == descriptor['profile_sha256'])
            require('identity/decision', input_['final_certifier_decision'] == 'certified')
            for field in ('expected_goal_run_revision', 'goal_run_revision'):
                NR.integer(input_[field], 'identity/' + field, minimum=0)
            require('identity/revision_step', input_['goal_run_revision'] == input_['expected_goal_run_revision'] + 1)
            require('identity/partition_recomputed', input_['scope']['scope_partition'] ==
                    S.scope_partition(dict(scope_kind='project', project_id=input_['scope']['project_id'])))
            require('identity/partition_storage', input_['scope']['storage_instance_id'] ==
                    w.storage.storage_instance_id)
            rvalidate('IdentityInput', input_, 'identity/input')
            derived = D.owner_identity(input_, self.formula)
            ind_event, ind_key = D.independent_identity(
                input_['scope']['goal_run_id'], input_['certification_receipt_ref'], input_['final_certifier_decision'],
                input_['expected_goal_run_revision'], input_['goal_run_revision'], input_['scope']['scope_partition'])
            require('identity/independent_key', derived['idempotency_key'] == ind_key)
            require('identity/independent_event_id', derived['event_id'] == ind_event)
            result = dict(input=input_, event_id=derived['event_id'], idempotency_key=derived['idempotency_key'],
                          replay_policy='dedupe_by_idempotency_key', recipe_sha256=hsj(D.RECIPE),
                          whole_input_sha256=hsj(input_))
            rvalidate('IdentityResult', result, 'identity/result')
            dispatch(w, m['method'], dict(request=request, identity_input=input_))
            # Final predicate after every helper: re-acquire and compare every whole source.
            for name in order:
                owner_id, handle = handles[name]
                fresh = w.registry.owner(owner_id, roles[name]).resolve(handle)[1]
                require('identity_final/source_changed/' + name, A.same(fresh, got[name]))
            self.helper_recheck(scope, got, 'final')
            handle = self._issue(IDENT + 'IdentityResult', result, kind='identity_result')
            slot.set(result)
            return handle, request

    def helper_recheck(self, scope, got, stage):
        live_recheck(self.world, scope, got, 'identity_helper', stage)

    def _unused(self, scope, got, stage):
        w = self.world
        if 'native' in got:
            state = w.native.state(scope)
            require('identity_helper/native_current/' + stage, state['body_version'] == got['native']['body_version'])
        if 'goal' in got:
            body, control, binding = w.goal.current(scope['goal_id'])
            require('identity_helper/goal_current/' + stage, body['version'] == got['goal']['goal_body_version'] and
                    control['value']['stop_state'] == 'none' and
                    binding['value']['bound_goal_run_id'] == scope['goal_run_id'])
        if 'assignment' in got:
            cell = w.storage.cell(T_ASSIGNMENT, S.k_component(scope['goal_run_id']))
            require('identity_helper/assignment_current/' + stage, cell is not None and cell['value']['revision'] ==
                    got['assignment']['original_assignment_revision'])
        if 'standard' in got:
            require('identity_helper/standard_durable/' + stage, w.standard.durable(got['standard']))

    def joins(self, scope, got):
        """I0 field-consistency joins across the complete pre-identity sources."""
        w = self.world
        native, goal, standard = got['native'], got['goal'], got['standard']
        asg, inv, res, refs, cause = got['assignment'], got['invocation'], got['resolver'], got['references'], got['causal']
        target = _base_facts(w, scope)['target']
        for name in ('assignment', 'invocation', 'resolver', 'references', 'causal'):
            require('i0/%s_target' % name, got[name]['target'] == target)
        require('i0/goal_run_bound', goal['bound_goal_run_id'] == scope['goal_run_id'])
        require('i0/goal_stop', goal['stop_state'] == 'none')
        require('i0/native_goal', native['whole']['current']['request']['scope']['goal_id'] == scope['goal_id'])
        require('i0/assignment_owner', asg['owner']['owner_ref'] == w.assignment.owner_id and
                asg['owner']['registered_owner_role'] == 'assignment')
        require('i0/assignment_role', asg['assigned_actor']['execution_role'] == 'verifier')
        require('i0/invocation_assignment', A.same(inv['assignment'], asg))
        require('i0/invocation_actor', inv['actual_actor']['actor_ref'] == asg['assigned_actor']['actor_ref'])
        require('i0/invocation_assignment_ref', inv['whole_invocation_result']['assignment_id'] ==
                asg['original_assignment_ref'] and
                inv['whole_invocation_result']['assignment_revision'] == asg['original_assignment_revision'])
        invocation_id = inv['whole_invocation_request']['invocation_id']
        require('i0/invocation_id', inv['whole_invocation_result']['invocation_id'] == invocation_id)
        require('i0/resolver_invocation', res['original_invocation_id'] == invocation_id)
        require('i0/references_invocation', refs['original_invocation_id'] == invocation_id)
        ri = res['resolved_identity']
        runtime = w.values['runtime']
        require('i0/effective_runtime', ri['effective_model'] == runtime['effective_model'] and
                ri['effective_platform'] == runtime['effective_provider'])
        bindings = {}
        for b in refs['bindings']:
            require('i0/reference_member_duplicate', b['reference_role'] not in bindings)
            bindings[b['reference_role']] = b['reference']
        require('i0/reference_member_set', set(bindings) == set(REFERENCE_ROLES))
        expect = dict(actor=asg['assigned_actor']['actor_ref'], requested_provider=ri['requested_platform'],
                      effective_provider=ri['effective_platform'], requested_model=ri['requested_model'],
                      effective_model=ri['effective_model'], requested_account=runtime['requested_account'],
                      effective_account=runtime['effective_account'])
        for role_ in REFERENCE_ROLES:
            require('i0/reference/' + role_, bindings[role_] == expect[role_])
        require('i0/causal_correlation', cause['correlation_id'] == inv['causal_source']['correlation_id'])
        require('i0/standard_run', standard['goal_run_id'] == scope['goal_run_id'])
        require('i0/standard_durable', w.standard.durable(standard))
        require('i0/standard_decision', standard['decision_receipt_sha256'] == native['decision']['receipt_sha256'])
        check_decision(w, scope, native['decision'], 'i0')


def live_recheck(w, scope, got, code, stage):
    """After a returning helper: the live sources the acquired values depend on are still current."""
    if 'native' in got:
        state = w.native.state(scope)
        require('%s/native_current/%s' % (code, stage), state['body_version'] == got['native']['body_version'])
    if 'goal' in got:
        body, control, binding = w.goal.current(scope['goal_id'])
        require('%s/goal_current/%s' % (code, stage), body['version'] == got['goal']['goal_body_version'] and
                control['value']['stop_state'] == 'none' and
                binding['value']['bound_goal_run_id'] == scope['goal_run_id'])
    if 'assignment' in got:
        cell = w.storage.cell(T_ASSIGNMENT, S.k_component(scope['goal_run_id']))
        require('%s/assignment_current/%s' % (code, stage), cell is not None and cell['value']['revision'] ==
                got['assignment']['original_assignment_revision'])
    if 'standard' in got:
        require('%s/standard_durable/%s' % (code, stage), w.standard.durable(got['standard']))


def dispatch(w, method_name, arguments, *, realm_override=None):
    """Validate each whole argument in the exact realm its method declares (methods.json)."""
    m = method(method_name)
    declared = {a['name']: (a['realm'], a['schema_ref']) for a in m['arguments']}
    for name, value in arguments.items():
        require('dispatch/undeclared/' + name, name in declared)
        realm, uri = declared[name]
        if realm_override and name in realm_override:
            realm = realm_override[name]
        try:
            errors = C.validate(realm, uri, value)
        except Exception:  # unresolvable in that realm: no cross-realm fallback
            raise Refusal('dispatch/%s/unresolvable_in_realm' % name)
        if errors:
            raise Refusal('dispatch/%s/schema' % name)
    return True


class NativeSourceIssuer(A.TestOwner):
    """Native source acquisition for the coordinator: issues the whole OriginalCertificationSource."""
    role = 'native_source'
    custody_codec = 'exact_json'

    def __init__(self, registry, world, **kw):
        super().__init__(registry, **kw)
        self.world = world

    def issue_source(self, scope, decision_handle, *, edit=None):
        w = self.world
        with self.recorder.call(self.owner_id, 'acquire_original_certification_source') as slot:
            _, decision = A.acquire(w.registry, decision_handle[0], 'final_decision', decision_handle[1])
            state = w.native.state(scope)
            whole = w.native.compose_source(scope, state, decision)
            if edit:
                whole = edit(whole)
                rvalidate('OriginalCertificationSource', whole, 'native/original_certification_source')
            self.check_source(scope, whole, state, decision)
            record = dict(whole=whole, decision=decision, body_revision=state['body']['body_revision'],
                          body_version=state['body_version'], status=state['body']['status'])
            handle = self._issue(None, record, kind='original_certification_source')
            slot.set(dict(sha256=hsj(whole)))
            return handle

    def check_source(self, scope, whole, state, decision):
        """U2/G1 joins of the whole source against the native store it was acquired from."""
        wf = whole['current']['original_start']['d01_current']['workflow']
        body = state['body']
        require('u2/status', wf['current_body']['status'] == body['status'])
        require('u2/body_revision', wf['current_body']['revision'] == body['body_revision'])
        require('u2/head_revision', wf['head']['revision'] == state['head']['revision'])
        members = [m['worknode_id'] for m in whole['current']['requirements']['required_set']['record']['members']]
        require('g1/required_set', members == list(body['required_worknodes']))
        done = [i['original_native_completion']['current']['worknode']['worknode_id']
                for i in whole['gates']['all_required_worknodes']]
        require('g1/required_completions', done == list(body['required_worknodes']))
        for i in whole['gates']['all_required_worknodes']:
            require('g1/completion_done', i['original_native_completion']['current']['worknode']['lifecycle'] == 'done')
        receipt = whole['original_final_decision']['complete_receipt']
        require('g/final_receipt', receipt['worknode_receipt_refs'] == decision['receipt']['worknode_receipt_refs'] and
                receipt['final_certifier_decision'] == decision['receipt']['final_certifier_decision'] and
                receipt['child_receipt_refs'] == [] and receipt['unresolved_risks'] == [])
        require('g/final_identity', whole['original_final_decision']['original_identity']['transaction_id'] ==
                decision['transaction_id'] and
                whole['original_final_decision']['original_identity']['source_sha256'] == decision['receipt_sha256'])
        require('g/source_argument', whole['original_final_decision']['original_source_argument_sha256'] ==
                decision['source_argument_sha256'])


class WholeProducer(IssuingOwner):
    """Producer prepare.v2: WholeProducerSource from acquired whole sources, then producer25 and submission."""
    role = 'producer'

    def prepare(self, scope, identity, handles, *, source_edit=None, candidate_edit=None):
        w = self.world
        with self.recorder.call(self.owner_id, 'prepare_producer') as slot:
            require('producer/identity_handle', type(identity) is tuple and len(identity) == 2)
            _, result = w.registry.owner(identity[0], 'identity').resolve(identity[1], root=IDENT + 'IdentityResult')
            roles = dict(native='native_source', goal='goal', standard='standard', assignment='assignment',
                         invocation='invocation', resolver='resolver', references='references', causal='causality')
            src = {n: A.acquire(w.registry, handles[n][0], roles[n], handles[n][1])[1] for n in roles}
            live_recheck(w, scope, src, 'producer_helper', 'acquired')
            facts = dict(assignment=src['assignment'], invocation=src['invocation'], resolver_graph=src['resolver'],
                         references=src['references'], causal=src['causal'])
            realm, uri = ROOTS['WholeProducerSource']
            ctx = C.Context(facts=dict({'=target': _base_facts(w, scope)['target']},
                                       **{'=' + k: v for k, v in facts.items()}), clock=w.storage.now,
                            rng=random.Random(hsj([self.owner_id, 'wps'])), owner_tag=self.owner_id)
            wps = C.compose(realm, uri, ctx, validate=False)
            adm = wps['identity_admission']
            adm.update(event_id=result['event_id'], idempotency_key=result['idempotency_key'],
                       replay_policy=result['replay_policy'], scope_partition=result['input']['scope']['scope_partition'],
                       certification_receipt_ref=result['input']['certification_receipt_ref'],
                       expected_goal_run_revision=result['input']['expected_goal_run_revision'],
                       goal_run_revision=result['input']['goal_run_revision'])
            self.seal(wps, tag='whole_producer_source', scope=dict(scope, thread_id=w.values['thread_id']))
            for name in ('assignment', 'invocation', 'resolver_graph', 'references', 'causal'):
                wps[name] = copy.deepcopy(facts[name])
            if source_edit:
                wps = source_edit(wps)
            rvalidate('WholeProducerSource', wps, 'producer/whole_source')
            # P9: identity admission must be the issued identity, field by field.
            for field in ('event_id', 'idempotency_key', 'replay_policy'):
                require('p9/' + field, wps['identity_admission'][field] == result[field])
            for field in ('scope_partition',):
                require('p9/' + field, wps['identity_admission'][field] == result['input']['scope'][field])
            for field in ('certification_receipt_ref', 'expected_goal_run_revision', 'goal_run_revision'):
                require('p9/' + field, wps['identity_admission'][field] == result['input'][field])
            for name, key in (('assignment', 'assignment'), ('invocation', 'invocation'), ('resolver_graph', 'resolver'),
                              ('references', 'references'), ('causal', 'causal')):
                require('producer/source/' + name, A.same(wps[name], src[key]))
            authenticate_structured(w, wps, 'producer/whole_source', scope)
            asg, inv, res = src['assignment'], src['invocation'], src['resolver']
            native, goal = src['native'], src['goal']
            runtime = w.values['runtime']
            occurred = native['decision']['issued_at_utc']
            payload = dict(event_name='goal_run.certified', schema_version=D.PAYLOAD, occurred_at_utc=occurred,
                           project_id=scope['project_id'], goal_id=scope['goal_id'], goal_revision=goal['goal_revision'],
                           thread_id=goal['thread_id'], actor_ref=asg['assigned_actor']['actor_ref'],
                           execution_role=asg['assigned_actor']['execution_role'],
                           requested_provider_ref=res['resolved_identity']['requested_platform'],
                           effective_provider_ref=res['resolved_identity']['effective_platform'],
                           requested_model_ref=res['resolved_identity']['requested_model'],
                           effective_model_ref=res['resolved_identity']['effective_model'],
                           requested_account_ref=runtime['requested_account'],
                           effective_account_ref=runtime['effective_account'],
                           correlation_id=inv['causal_source']['correlation_id'],
                           causation_event_ref=w.values['cause_event_id'],
                           evidence_refs=['TEST_ONLY:evidence:%s' % wn for wn in w.values['worknodes']],
                           artifact_refs=[],
                           payload=dict(goal_run_id=scope['goal_run_id'],
                                        certification_receipt_ref=result['input']['certification_receipt_ref'],
                                        validator_outputs=[dict(validator_id='TEST_ONLY:validator:%s' % wn,
                                                                outcome='passed',
                                                                evidence_ref='TEST_ONLY:evidence:%s' % wn)
                                                           for wn in w.values['worknodes']],
                                        worknode_receipt_refs=list(native['decision']['receipt']['worknode_receipt_refs']),
                                        unresolved_risk_refs=[], final_certifier_decision='certified'),
                           expected_goal_run_revision=result['input']['expected_goal_run_revision'],
                           goal_run_revision=result['input']['goal_run_revision'],
                           idempotency_key=result['idempotency_key'])
            event = dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project',
                         event_id=result['event_id'], event_type='goal_run.certified', project_id=scope['project_id'],
                         thread_id=goal['thread_id'], run_id=scope['goal_run_id'], node_id=None, attempt_id=None,
                         actor_ref=payload['actor_ref'], requested_account_ref=payload['requested_account_ref'],
                         effective_account_ref=payload['effective_account_ref'], occurred_at_utc=occurred,
                         producer_sequence_id=None, correlation_id=payload['correlation_id'],
                         causation_event_id=w.values['cause_event_id'], parent_event_id=None,
                         idempotency_key=result['idempotency_key'], payload_schema_id=D.PAYLOAD, payload=payload,
                         payload_ref=None, redaction_profile='no_secrets', replay_policy=result['replay_policy'],
                         migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None,
                                        migration_id=None, compatibility_event_type=None))
            if candidate_edit:
                event = candidate_edit(event)
            self.check(scope, event, result, src, wps)
            submission = self.submission(event, result, wps)
            live_recheck(w, scope, src, 'producer_final', 'return')
            record = dict(whole_producer_source=wps, producer25=event, submission=submission)
            handle = self._issue(None, record, kind='prepared_producer')
            slot.set(dict(event_id=event['event_id']))
            return handle, event

    def submission(self, event, result, wps):
        realm, uri = ROOTS[SUBMISSION]
        w = self.world
        ctx = C.Context(facts={}, clock=w.storage.now, rng=random.Random(1), owner_tag=self.owner_id)
        sub = C.compose(realm, uri, ctx, validate=False)
        for key in list(sub):
            if key in event:
                sub[key] = copy.deepcopy(event[key])
        rvalidate(SUBMISSION, sub, 'producer/submission')
        for key in sub:
            if key in event:
                require('producer/submission_field/' + key, A.same(sub[key], event[key]))
        return sub

    def check(self, scope, event, result, src, wps):
        """Whole producer predicates: every output field matched to its original whole source."""
        w = self.world
        A.require('producer/envelope_members', set(event) <= set(D.ENVELOPE_FIELDS))
        for field in D.ENVELOPE_FIELDS:
            A.require('producer/required_present/' + field, field in event)
        payload = event['payload']
        A.require('producer/payload_type', type(payload) is dict)
        D.bank().validate(D.PAYLOAD, payload, 'producer/payload')
        for field in ('goal_revision', 'expected_goal_run_revision', 'goal_run_revision'):
            NR.integer(payload[field], 'producer/payload.' + field, minimum=1)
        NR.event_time(event['occurred_at_utc'], 'producer/occurred_at_utc')
        asg, inv, res = src['assignment'], src['invocation'], src['resolver']
        native, goal = src['native'], src['goal']
        ri = res['resolved_identity']
        runtime = w.values['runtime']
        expected = {
            'event_id': result['event_id'], 'idempotency_key': result['idempotency_key'],
            'replay_policy': 'dedupe_by_idempotency_key', 'event_type': 'goal_run.certified', 'scope_kind': 'project',
            'payload_schema_id': D.PAYLOAD, 'project_id': scope['project_id'], 'thread_id': goal['thread_id'],
            'run_id': scope['goal_run_id'], 'actor_ref': asg['assigned_actor']['actor_ref'],
            'requested_account_ref': runtime['requested_account'], 'effective_account_ref': runtime['effective_account'],
            'occurred_at_utc': native['decision']['issued_at_utc'], 'correlation_id': inv['causal_source']['correlation_id'],
            'causation_event_id': w.values['cause_event_id'], 'payload_ref': None, 'node_id': None,
            'attempt_id': None, 'parent_event_id': None, 'producer_sequence_id': None,
            'payload.goal_revision': goal['goal_revision'], 'payload.execution_role': asg['assigned_actor']['execution_role'],
            'payload.requested_provider_ref': ri['requested_platform'],
            'payload.effective_provider_ref': ri['effective_platform'],
            'payload.requested_model_ref': ri['requested_model'], 'payload.effective_model_ref': ri['effective_model'],
            'payload.idempotency_key': result['idempotency_key'],
            'payload.expected_goal_run_revision': result['input']['expected_goal_run_revision'],
            'payload.goal_run_revision': result['input']['goal_run_revision'],
            'payload.payload.certification_receipt_ref': result['input']['certification_receipt_ref'],
            'payload.payload.worknode_receipt_refs': native['decision']['receipt']['worknode_receipt_refs'],
            'payload.actor_ref': asg['assigned_actor']['actor_ref'], 'payload.occurred_at_utc':
                native['decision']['issued_at_utc'],
        }
        for path, value in expected.items():
            actual = event
            for part in path.split('.'):
                actual = actual.get(part, KeyError) if type(actual) is dict else KeyError
            A.require('producer/field/' + path, actual is not KeyError and A.same(actual, value))
        A.require('producer/cause_appended', w.storage.read_event(w.values['cause_event_id'])['event_id'] ==
                  w.values['cause_event_id'])
        try:
            NR.event_value_bytes(event, 'producer/codec')
            NR.producer_digest(event, 'producer/semantic_digest')
        except NR.NumruleRefusal as error:
            raise Refusal('producer/codec_unavailable') from error


# ------------------------------------------------------------------ world

def default_values(**over):
    run = 'TEST_ONLY:goal_run:cf1-\u03b1-e\u0301-\U0001f98a'
    v = dict(project_id='TEST_ONLY-project-cf1-\u03b2\u0301', goal_id='TEST_ONLY:goal:cf1', goal_run_id=run,
             workgraph_id='TEST_ONLY:workgraph:cf1', workgraph_revision=1,
             workgraph_sha256=sha(b'TEST_ONLY:workgraph:cf1:1'), thread_id='TEST_ONLY:thread:cf1', goal_revision=3,
             worknodes=['TEST_ONLY:worknode:a', 'TEST_ONLY:worknode:b'], criteria=['TEST_ONLY:criterion:1'],
             actor_ref='TEST_ONLY:actor:certifier', assignment_ref='TEST_ONLY:assignment:cf1',
             invocation_id='TEST_ONLY:invocation:cf1', invocation_operation='TEST_ONLY:operation:invocation:cf1',
             correlation_id='TEST_ONLY:correlation:cf1',
             runtime=dict(requested_provider='TEST_ONLY:provider:a', effective_provider='TEST_ONLY:provider:a',
                          requested_model='TEST_ONLY:model:a', effective_model='TEST_ONLY:model:a-2026',
                          requested_account='TEST_ONLY:account:1', effective_account='TEST_ONLY:account:1'))
    v.update(over)
    return v


class World:
    """One TEST_ONLY execution of the CF-01..05 original path."""

    def __init__(self, work, *, values=None, profile_kw=None, identity_formula='certified_v3', realm_override=None):
        self.work = Path(work)
        self.values = values or default_values()
        self.rng = random.Random()
        self.registry = A.OwnerRegistry()
        self.recorder = self.registry.recorder
        self.storage = CF1Storage.create(self.work / 'native')
        self.goal_store = CF1Storage.create(self.work / 'goal')
        self.recorder.observe('storage:native', self.storage.observe)
        self.recorder.observe('storage:goal', self.goal_store.observe)
        self.expected_profile_digest = (ROOT / COORD_PKG / 'installed-profile-digest.txt').read_text().strip()
        self.expected_producer_digest = (ROOT / PRODUCER_PKG / 'native-v7/installed-profile-digest.txt').read_text().strip()
        self.profile = ProfileOwner(self.registry, self, **(profile_kw or {}))
        self.goal = GoalOwner(self.registry, self)
        self.native = NativeRunOwner(self.registry, self)
        self.final = FinalDecisionOwner(self.registry, self)
        self.standard = StandardOwner(self.registry, self)
        self.native_source = NativeSourceIssuer(self.registry, self)
        self.assignment = AssignmentOwner(self.registry, self)
        self.invocation = InvocationOwner(self.registry, self)
        self.resolver = ResolverOwner(self.registry, self)
        self.references = ReferenceOwner(self.registry, self)
        self.causality = CausalOwner(self.registry, self)
        self.partition = PartitionRouteOwner(self.registry, self)
        self.identity = WholeIdentityOwner(self.registry, self, formula=identity_formula, realm_override=realm_override)
        self.producer = WholeProducer(self.registry, self)
        self.birth = BirthCoordinator(self.registry, self)
        self.appender = A.AppendOwner(self.registry, self.storage)
        for owner in (self.native, self.goal):
            self.recorder.observe(owner.owner_id, owner.observe)

    def owner_by_id(self, owner_id):
        role = self.registry.roster().get(owner_id) if type(owner_id) is str else None
        return None if role is None else self.registry.owner(owner_id, role)

    @property
    def scope(self):
        v = self.values
        return dict(project_id=v['project_id'], goal_id=v['goal_id'], goal_run_id=v['goal_run_id'],
                    workgraph_id=v['workgraph_id'])

    def coord_scope(self, scope):
        return dict(project_id=scope['project_id'], goal_id=scope['goal_id'], goal_run_id=scope['goal_run_id'],
                    work_graph_id=scope['workgraph_id'], storage_instance_id=self.storage.storage_instance_id,
                    scope_partition=S.scope_partition(dict(scope_kind='project', project_id=scope['project_id'])))

    def coord_key(self, family, scope, cscope=None):
        cscope = cscope or self.coord_scope(scope)
        return 'goal_certified_event_%s.v1:%s:%s' % (family, S.k_component(cscope['project_id']),
                                                      S.k_component(cscope['goal_run_id']))

    def cf2_inputs(self, obs):
        """Whole native/producer roots DG-CF2 consumes at the DG merge (owner handles, not copies)."""
        return dict(original_certification_source=obs['handles']['native'],
                    certification_candidate_result=obs['candidate'],
                    whole_producer_source=(self.producer.owner_id, obs['prepared']),
                    current_workflow_source=obs['current_workflow_source'])


def cause_event(world):
    v = world.values
    c = dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project',
             event_id='TEST_ONLY:goal_test.cause:cf1', event_type='goal_test.cause', project_id=v['project_id'],
             thread_id=None, run_id=v['goal_run_id'], node_id=None, attempt_id=None, actor_ref='TEST_ONLY:actor:cause',
             requested_account_ref=None, effective_account_ref=None, occurred_at_utc='2026-11-11T11:59:00Z',
             producer_sequence_id=None, correlation_id=v['correlation_id'], causation_event_id=None,
             parent_event_id=None, idempotency_key='TEST_ONLY:cause:cf1', payload_schema_id='TEST_ONLY:cause.v1',
             payload=dict(qualification=QUALIFICATION), payload_ref=None, redaction_profile='no_secrets',
             replay_policy='dedupe_by_idempotency_key',
             migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None,
                            compatibility_event_type=None))
    events, _, _ = world.appender.append_original('TEST_ONLY:operation:cause', dict(kind='cause'), [c])
    v['cause_event_id'] = world.appender.event(events[0])['event_id']
    return v['cause_event_id']
