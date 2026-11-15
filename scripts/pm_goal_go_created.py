"""C12-GO goal.created complete boundaries (lane 18; closes s3ao conformance gap G5).

Three executable boundaries over the authored goal_start fixtures and every
companion they carry, each a complete call whose refusals are named rows:

1. Original command custody / producer boundary (CV-341, SP-294, GRS-066):
   the whole custody wrapper (owner schema, whole definition, every keyword), then
   the cross-copy facts no schema can state: the D identity recipe, the
   explicitly-null envelope members, envelope <- original source, payload <- record
   and body commit, publication <- first receipt, owner result <- record/body
   commit/publication, outcome digest and logical refs, UI response joins, the
   three custody digests, and the CV-341 order body -> event/first receipt ->
   result settlement -> response. Each independently held copy is changed alone
   (derived digests re-derived) and refuses at its own row.
2. SP-298 passive reader `storage.goal_created.current_read.v1@1.0.0` over the
   installed `Plans/goal_created_reader_contracts/` package: request shape,
   exact resource bindings and support map, role installation, authority,
   SP-278 source admission, issued cursor / budget / stale_cursor (every changed
   CURRENT/manifest, generation, anchor, frontier, dataset, snapshot, route or
   installed map), inclusive last-frame revalidation, route dispatch on the five
   original fields, routed payload schema, first-receipt / full-value / body
   receipt proofs (Storage canonical value bytes), observation joins, progress and
   the response-byte budget. The observation's uint64 domain is entailed by the
   admitted frame sequence grammar (shared storage_uint64) and the routed payload schema.
3. SP-298 member resolver `storage.goal_start_command.resolve_member.v1@1.0.0`
   (command-members.json): key K, installation, authority, row, wrapper,
   identity, phase (member_pending / member_unavailable) and value schema.

The supplied support map declares every native role unsupported; it is a real
negative (`reader_unavailable`). Positive reads use a TEST_ONLY installation map
identical except for the role bits. Native execution remains NOT_RUN.
"""
import base64
import copy
import hashlib
import json
from pathlib import Path
from urllib.parse import urldefrag

import pm_event_numbers as n
import pm_goal_guard_tables as tables
import pm_goal_oracle_common as c
import pm_goal_go_schema as schemas
from pm_goal_time import instant

ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / 'Plans'
FAMILY = 'goal.created'
PKG = PLANS / 'goal_created_reader_contracts'
GO_EVIDENCE = {}
# payload_ref is pinned null by the owner ProducerInput schema; these are nullable there and null only by SP-294.
ENVELOPE_NULLS = ('run_id', 'node_id', 'attempt_id', 'requested_account_ref', 'effective_account_ref',
                  'producer_sequence_id', 'parent_event_id')
RESOURCE_FILES = {
    'contracts/pm.goal.created.reader_contract.schema.v1': PLANS / 'goal_created_reader_contracts.schema.json',
    'contracts/pm.goal.created.routes.v1': PKG / 'routes.json',
    'schemas/pm.event_record_index_checkpoint.schema.v1': PLANS / 'event_record_index_checkpoint.schema.json',
    'schemas/pm.goal_runtime_event.goal_created.schema.v2': PKG / 'retained-v2.schema.json',
    'schemas/pm.goal_runtime_event.goal_created.schema.v3': PLANS / 'event_payloads/goal_runtime/goal_created.schema.json',
    'schemas/pm.goal_start_command_custody.schema.v1': PLANS / 'goal_start_command_custody.schema.json',
    'contracts/pm.goal.start.command_member_mapping.v1': PKG / 'command-members.json',
}


def H(value):
    """sha256 of the RFC 8785 bytes (verified on the authored rows: owner_result_sha256,
    producer_semantic_sha256, original/current_source_sha256). Total: a value the canonical
    codec cannot encode (n.Refusal) has no digest, so a digest row comparing it refuses."""
    try:
        return hashlib.sha256(n.qualified_jcs(value)).hexdigest()
    except n.Refusal:
        return None


def D(record):
    """SP-294: D = SHA256(JCS(["pm.goal.created.command.v1","project",storage,project,thread,command,instance,operation,goal]))."""
    return H(['pm.goal.created.command.v1', 'project', record['storage_instance_id'], record['project_id'],
              record['thread_id'], 'cmd.chat.goal.start', record['command_instance_id'], record['operation_id'],
              record['goal_id']])


def K(project, thread, instance):
    """command-members.json: key_prefix + lowercase hex of each exact scalar UTF-8, ':' separated."""
    return 'goal_start_command.v1:' + ':'.join(x.encode().hex() for x in (project, thread, instance))


def registry():
    available, aliases = {}, {}
    files = (list(PLANS.glob('*.schema.json')) + list((PLANS / 'event_payloads/goal_runtime').glob('*.schema.json'))
             + list(PKG.glob('*.schema.json')))
    for path in files:
        document = c.load(path)
        uri = 'https://puppetmaster.local/' + path.relative_to(ROOT).as_posix()
        available[uri] = path
        aliases[uri] = path
        if '$id' in document:
            available[document['$id']] = path
            if path.parent.name == 'goal_runtime' and ':' not in document['$id']:
                alias = 'https://puppetmaster.local/schemas/event_payloads/goal_runtime/' + document['$id']
                available[alias] = path
                aliases[alias] = path
        available[path.name] = path
    selected = {PLANS / 'goal_start_command_custody.schema.json', PLANS / 'goal_runtime_contracts.schema.json',
                PLANS / 'goal_created_reader_support_map.schema.json',
                PLANS / 'goal_created_reader_contracts.schema.json', PKG / 'retained-v2.schema.json',
                PLANS / 'event_payloads/goal_runtime/goal_created.schema.json', PLANS / 'event_record.schema.json'}
    selected |= set(PKG.glob('*.schema.json'))
    done = set()

    def refs(value):
        if isinstance(value, dict):
            if '$ref' in value:
                yield urldefrag(value['$ref'])[0]
            for child in value.values():
                yield from refs(child)
        elif isinstance(value, list):
            for child in value:
                yield from refs(child)
    while selected != done:
        for path in tuple(selected - done):
            for uri in refs(c.load(path)):
                if uri and uri in available:
                    selected.add(available[uri])
            done.add(path)
    return c.schema_registry(sorted(selected), aliases={k: v for k, v in aliases.items() if v in selected})


class Checks:
    def __init__(self):
        reg = registry()
        reader = c.load(PLANS / 'goal_created_reader_contracts.schema.json')['$id']
        contracts = c.load(PLANS / 'goal_runtime_contracts.schema.json')

        def owner(path, pointer='#', **kw):
            return schemas.checker(path, pointer, reg, **kw)
        self.custody = owner(PLANS / 'goal_start_command_custody.schema.json')
        self.result = owner(PLANS / 'goal_runtime_contracts.schema.json', '#/$defs/GoalStartResultV2')
        self.request = owner(PLANS / 'goal_runtime_contracts.schema.json', '#/$defs/GoalStartRequestV2')
        self.payload_v3 = owner(PLANS / 'event_payloads/goal_runtime/goal_created.schema.json')
        self.payload_v2 = owner(PKG / 'retained-v2.schema.json')
        self.read_request = owner(PLANS / 'goal_created_reader_contracts.schema.json', '#/$defs/ReadRequestV1')
        self.sp278_token = owner(PLANS / 'goal_created_reader_contracts.schema.json', '#/$defs/SP278ReadToken')
        self.cursor = owner(PLANS / 'goal_created_reader_contracts.schema.json', '#/$defs/IssuedPrivateGoalCreatedCursorV1')
        self.member_request = owner(PLANS / 'goal_created_reader_contracts.schema.json', '#/$defs/MemberRequestV1')
        self.routes = owner(PKG / 'routes.schema.json')
        self.members = owner(PKG / 'command-members.schema.json')
        self.bindings = owner(PKG / 'resource-bindings.schema.json')
        self.retrieval = owner(PKG / 'schema-retrieval-bindings.schema.json')
        self.support = owner(PLANS / 'goal_created_reader_support_map.schema.json')
        # Output self-checks of values the reader builds itself: enforced, never refusal rows.
        self.out = {name: c.validator({'$ref': reader + '#/$defs/' + name}, reg, current=True)
                    for name in ('ObservationV1', 'ReadPageV1', 'ReadFailureV1', 'MemberSuccessV1', 'MemberFailureV1')}
        del contracts


CHECKS = None


def checks():
    global CHECKS
    if CHECKS is None:
        CHECKS = Checks()
    return CHECKS


# --------------------------------------------------------------------------- 1. custody / producer

def custody(value):
    """Original command custody wrapper (CV-341/SP-294): owner schema, then the cross-copy facts.

    Every independently held copy is compared with one anchor: the record identity
    (storage/project/thread/command instance/operation/goal), the D-derived event ID
    E, the body commit, the first append receipt, the original source capture's
    normalized identity, or the logical member key K. The owner schema already pins
    the single-copy constants (payload_ref null, redaction/replay policy, revision 1),
    so no row restates them."""
    k = checks()
    errors = k.custody(value)
    if errors:
        return errors  # a decided owner-schema refusal: later facts index members the schema guarantees
    g = c.Gates()
    r = value['record']
    p, bc, pub = r['producer_input'], r['body_commit'], r['original_publication']
    res, co, ui = r['owner_result'], r['command_outcome'], r['ui_response']
    src, cur = r['original_source'], r['current_source']
    # CV-1100 current integers at the owner's type-less integer literals (`const: 1`), which JSON-Schema
    # numeric equality alone would also meet with 1.0: the shared current-integer call decides them.
    g.require('goal.created/current_integers', all(current_int(x) for x in integer_literals(r)))
    key = K(r['project_id'], r['thread_id'], r['command_instance_id'])
    E = 'goal.created.v1:' + D(r)
    succeeded = res is not None and res.get('status') == 'succeeded'
    g.require('goal.created/digest/original_source', r['original_source_sha256'] == H(src))
    g.require('goal.created/digest/current_source', r['current_source_sha256'] == H(cur))
    ident = src['normalized_identity']
    owner = ident['owner_identity']
    g.require('goal.created/source/operation', ident['operation_id'] == r['operation_id'])
    g.require('goal.created/source/command_instance', ident['command_instance_id'] == r['command_instance_id'])
    g.require('goal.created/source/owner_project', owner['project_id'] == r['project_id'])
    g.require('goal.created/source/owner_thread', owner['thread_id'] == r['thread_id'])
    g.require('goal.created/source/current_identity', c.same_json_value(cur['normalized_identity'], ident))
    g.require('goal.created/order/source_capture', instant(src['captured_at']) <= instant(cur['captured_at']))
    if p is not None:
        g.require('goal.created/digest/producer_semantic', r['producer_semantic_sha256'] == H(p))
        g.require('goal.created/identity/event_id', p['event_id'] == E)
        g.require('goal.created/identity/idempotency_key', p['idempotency_key'] == 'goal.created.command.v1:' + D(r))
        g.require('goal.created/envelope/project_id', p['project_id'] == r['project_id'])
        g.require('goal.created/envelope/thread_id', p['thread_id'] == r['thread_id'])
        for field in ENVELOPE_NULLS:
            g.require('goal.created/envelope/null/' + field, p[field] is None)
        g.require('goal.created/envelope/migration_null', all(x is None for x in p['migration'].values()))
        g.require('goal.created/envelope/actor', p['actor_ref'] == src['actor_ref'])
        g.require('goal.created/envelope/correlation', p['correlation_id'] == src['correlation_id'])
        g.require('goal.created/envelope/causation', p['causation_event_id'] == src['causation_event_id'])
        pay = p['payload']
        g.require('goal.created/payload/goal_id', pay['goal_id'] == r['goal_id'])
        g.require('goal.created/payload/project_id', pay['project_id'] == r['project_id'])
        g.require('goal.created/payload/thread_id', pay['thread_id'] == r['thread_id'])
        g.require('goal.created/payload/original_action_ref', pay['original_action_ref'] == ident['request_ref'])
        g.require('goal.created/payload/source_refs', pay['source_refs'] == src['origin_refs'])
        if bc is not None:
            g.require('goal.created/payload/accepted_revision_hash', pay['accepted_revision_hash'] == bc['accepted_revision_hash'])
            g.require('goal.created/payload/currentness_hash', pay['currentness_hash'] == bc['currentness_hash'])
            g.require('goal.created/payload/objective_revision_ref', c.same_json_value(pay['objective_revision_ref'], bc['objective_revision_selector']))
            g.require('goal.created/payload/body_receipt_request', c.same_json_value(pay['body_mutation_receipt_request'], bc['receipt_request']))
            g.require('goal.created/payload/body_receipt_sha256', pay['body_mutation_receipt_sha256'] == bc['receipt_sha256'])
    if pub is not None and p is not None:
        receipt, appended = pub['first_append_receipt'], pub['original_append_result']
        g.require('goal.created/publication/event_id', pub['event_id'] == E)
        g.require('goal.created/publication/receipt_event', receipt['event_id'] == E)
        g.require('goal.created/publication/append_result', appended['event_id'] == E
                  and all(appended[x] == receipt[x] for x in ('sequence_id', 'byte_offset')))
        g.require('goal.created/order/body_before_receipt', instant(p['occurred_at_utc']) <= instant(receipt['acknowledged_at_utc']))
    if res is not None:
        for field in ('goal_id', 'project_id', 'thread_id', 'operation_id', 'command_instance_id'):
            g.require('goal.created/result/' + field, res[field] == r[field])
    if succeeded:
        g.require('goal.created/result/accepted_revision_hash', res['accepted_revision_hash'] == bc['accepted_revision_hash'])
        g.require('goal.created/result/currentness_hash', res['currentness_hash'] == bc['currentness_hash'])
        cr = res['creation_receipt']
        g.require('goal.created/result/creation_receipt/event_id', cr['event_id'] == E)
        for field in ('first_append_receipt', 'original_append_result', 'original_event_value_commitment'):
            g.require('goal.created/result/creation_receipt/' + field, c.same_json_value(cr[field], pub[field]))
        g.require('goal.created/result/creation_receipt/body_receipt_request', c.same_json_value(cr['body_receipt_request'], bc['receipt_request']))
        g.require('goal.created/result/creation_receipt/body_receipt_sha256', cr['body_receipt_sha256'] == bc['receipt_sha256'])
        g.require('goal.created/order/receipt_before_settlement',
                  instant(pub['first_append_receipt']['acknowledged_at_utc']) <= instant(co['observed_at']))
    if co is not None and co.get('owner_result_ref') is not None:
        g.require('goal.created/outcome/owner_result_sha256', co['owner_result_sha256'] == H(res))
        g.require('goal.created/outcome/owner_result_ref', co['owner_result_ref'] == key + '#/owner_result')
        if succeeded:
            g.require('goal.created/outcome/result_receipt_ref', co['result_receipt_ref'] == key + '#/creation_receipt')
    if co is not None:
        g.require('goal.created/outcome/identity', c.same_json_value(co['identity'], owner))
        g.require('goal.created/outcome/request_digest', co['payload_sha256'] == ident['payload_sha256'])
    if ui is not None and co is not None:
        if co.get('owner_result_ref') is not None:
            g.require('goal.created/response/owner_result_ref', ui['owner_result_ref'] == key + '#/owner_result')
        if succeeded:
            g.require('goal.created/response/receipt_ref', ui['receipt_ref'] == key + '#/creation_receipt')
            g.require('goal.created/response/event_refs', ui['event_refs'] == [E])
        g.require('goal.created/response/command_instance_id', ui['command_instance_id'] == r['command_instance_id'])
        g.require('goal.created/response/operation_id', ui['operation_id'] == r['operation_id'])
        g.require('goal.created/response/owner_identity', c.same_json_value(ui['owner_identity'], owner))
        g.require('goal.created/response/request_ref', ui['request_ref'] == ident['request_ref'])
        g.require('goal.created/order/settlement_response', instant(co['observed_at']) <= instant(ui['ts']))
    return g.errors


def current_int(value):
    try:
        n.current_integer(value)
        return True
    except n.Refusal:
        return False


def integer_literals(r):
    """The custody row's type-less integer-literal slots: revision 1 of payload, body commit and owner result."""
    out = []
    p = r.get('producer_input')
    if p is not None:
        out += [p['payload'].get('goal_revision'), p['payload'].get('accepted_objective_revision')]
    if r.get('body_commit') is not None:
        out.append(r['body_commit'].get('goal_revision'))
    if r.get('owner_result') is not None and 'goal_revision' in r['owner_result']:
        out.append(r['owner_result']['goal_revision'])
    return [x for x in out if x is not None]


def rehash(value):
    """Re-derive every custody digest from its preimage (a coherent single-copy edit)."""
    r = value['record']
    r['original_source_sha256'] = H(r['original_source'])
    r['current_source_sha256'] = H(r['current_source'])
    if r['producer_input'] is not None:
        r['producer_semantic_sha256'] = H(r['producer_input'])
    if r['owner_result'] is not None and r['command_outcome'] is not None and r['command_outcome'].get('owner_result_ref'):
        r['command_outcome']['owner_result_sha256'] = H(r['owner_result'])
    return value


def custody_witnesses():
    """(row, mutate, rehash) single-defect witnesses on the successful settlement row.

    A copy is changed alone; where the owner rule makes other copies follow one
    anchor (the current capture repeats the original normalized identity; the
    outcome and response repeat the original owner identity; the owner result's
    creation receipt repeats the publication), the followers change with it, so
    only the fact under test is false. Derived digests are re-derived except where
    the digest itself is the defect."""
    def at(*paths, new):
        def mutate(v):
            for path in paths:
                node = v['record']
                for part in path[:-1]:
                    node = node[part]
                node[path[-1]] = new(node[path[-1]]) if callable(new) else copy.deepcopy(new)
        return mutate
    other = lambda x: x + ':other'
    thread2 = lambda x: x.replace('7468725f31', '7468725f32')
    ni = ('original_source', 'normalized_identity')
    cni = ('current_source', 'normalized_identity')
    owners = [ni + ('owner_identity',), cni + ('owner_identity',), ('command_outcome', 'identity'), ('ui_response', 'owner_identity')]
    pubr = ('original_publication', 'first_append_receipt')
    crr = ('owner_result', 'creation_receipt', 'first_append_receipt')
    puba = ('original_publication', 'original_append_result')
    cra = ('owner_result', 'creation_receipt', 'original_append_result')
    out = [
        ('goal.created/current_integers', at(('producer_input', 'payload', 'goal_revision'), new=1.0), True),
        ('goal.created/digest/original_source', at(('original_source_sha256',), new='0' * 64), False),
        ('goal.created/digest/current_source', at(('current_source_sha256',), new='0' * 64), False),
        ('goal.created/digest/producer_semantic', at(('producer_semantic_sha256',), new='0' * 64), False),
        ('goal.created/outcome/owner_result_sha256', at(('command_outcome', 'owner_result_sha256'), new='0' * 64), False),
        ('goal.created/source/operation', at(ni + ('operation_id',), cni + ('operation_id',), new=other), True),
        ('goal.created/source/command_instance', at(ni + ('command_instance_id',), cni + ('command_instance_id',), new=other), True),
        ('goal.created/source/owner_project', at(*[o + ('project_id',) for o in owners], new=other), True),
        ('goal.created/source/owner_thread', at(*[o + ('thread_id',) for o in owners], new=other), True),
        ('goal.created/source/current_identity', at(cni + ('dispatch_frame_id',), new=other), True),
        ('goal.created/order/source_capture', at(('current_source', 'captured_at'), new='2026-09-12T07:59:00Z'), True),
        ('goal.created/identity/event_id', at(('producer_input', 'event_id'), new=other), True),
        ('goal.created/identity/idempotency_key', at(('producer_input', 'idempotency_key'), new=other), True),
        ('goal.created/envelope/project_id', at(('producer_input', 'project_id'), new=other), True),
        ('goal.created/envelope/thread_id', at(('producer_input', 'thread_id'), new=other), True),
        ('goal.created/envelope/migration_null', at(('producer_input', 'migration', 'migration_id'), new='MIG-OTHER@1.0.0'), True),
        ('goal.created/envelope/actor', at(('producer_input', 'actor_ref'), new=other), True),
        ('goal.created/envelope/correlation', at(('producer_input', 'correlation_id'), new=other), True),
        ('goal.created/envelope/causation', at(('producer_input', 'causation_event_id'), new='evt:other-cause'), True),
        ('goal.created/payload/goal_id', at(('producer_input', 'payload', 'goal_id'), new=other), True),
        ('goal.created/payload/project_id', at(('producer_input', 'payload', 'project_id'), new=other), True),
        ('goal.created/payload/thread_id', at(('producer_input', 'payload', 'thread_id'), new=other), True),
        ('goal.created/payload/original_action_ref', at(('producer_input', 'payload', 'original_action_ref'), new=other), True),
        ('goal.created/payload/source_refs', at(('producer_input', 'payload', 'source_refs'), new=lambda refs: list(reversed(refs))), True),
        ('goal.created/payload/accepted_revision_hash', at(('producer_input', 'payload', 'accepted_revision_hash'), new='a' * 64), True),
        ('goal.created/payload/currentness_hash', at(('producer_input', 'payload', 'currentness_hash'), new='b' * 64), True),
        ('goal.created/payload/objective_revision_ref',
         at(('producer_input', 'payload', 'objective_revision_ref', 'storage_instance_id'), new='22222222-2222-4222-8222-222222222222'), True),
        ('goal.created/payload/body_receipt_request', at(('producer_input', 'payload', 'body_mutation_receipt_request', 'operation_id'), new=other), True),
        ('goal.created/payload/body_receipt_sha256', at(('producer_input', 'payload', 'body_mutation_receipt_sha256'), new='c' * 64), True),
        ('goal.created/publication/event_id', at(('original_publication', 'event_id'), new=other), True),
        ('goal.created/publication/receipt_event', at(pubr + ('event_id',), crr + ('event_id',), new=other), True),
        ('goal.created/publication/append_result', at(puba + ('byte_offset',), cra + ('byte_offset',), new=lambda x: x + 1), True),
        ('goal.created/order/body_before_receipt', at(('producer_input', 'occurred_at_utc'), new='2026-09-12T08:00:04.5Z'), True),
        ('goal.created/result/goal_id', at(('owner_result', 'goal_id'), new=other), True),
        ('goal.created/result/project_id', at(('owner_result', 'project_id'), new=other), True),
        ('goal.created/result/thread_id', at(('owner_result', 'thread_id'), new=other), True),
        ('goal.created/result/operation_id', at(('owner_result', 'operation_id'), new=other), True),
        ('goal.created/result/command_instance_id', at(('owner_result', 'command_instance_id'), new=other), True),
        ('goal.created/result/accepted_revision_hash', at(('owner_result', 'accepted_revision_hash'), new='a' * 64), True),
        ('goal.created/result/currentness_hash', at(('owner_result', 'currentness_hash'), new='b' * 64), True),
        ('goal.created/result/creation_receipt/event_id', at(('owner_result', 'creation_receipt', 'event_id'), new=other), True),
        ('goal.created/result/creation_receipt/first_append_receipt', at(crr + ('commit_group_id',), new=other), True),
        ('goal.created/result/creation_receipt/original_append_result', at(cra + ('segment_ref',), new=other), True),
        ('goal.created/result/creation_receipt/original_event_value_commitment',
         at(('owner_result', 'creation_receipt', 'original_event_value_commitment', 'sha256'), new='d' * 64), True),
        ('goal.created/result/creation_receipt/body_receipt_request', at(('owner_result', 'creation_receipt', 'body_receipt_request', 'goal_id'), new=other), True),
        ('goal.created/result/creation_receipt/body_receipt_sha256', at(('owner_result', 'creation_receipt', 'body_receipt_sha256'), new='c' * 64), True),
        ('goal.created/order/receipt_before_settlement',
         at(('command_outcome', 'observed_at'), ('ui_response', 'ts'), new='2026-09-12T08:00:03Z'), True),
        ('goal.created/outcome/owner_result_ref', at(('command_outcome', 'owner_result_ref'), new=thread2), True),
        ('goal.created/outcome/result_receipt_ref', at(('command_outcome', 'result_receipt_ref'), new=thread2), True),
        ('goal.created/outcome/identity', at(('command_outcome', 'identity', 'server_id'), new=other), True),
        ('goal.created/outcome/request_digest', at(('command_outcome', 'payload_sha256'), new='e' * 64), True),
        ('goal.created/response/owner_result_ref', at(('ui_response', 'owner_result_ref'), new=thread2), True),
        ('goal.created/response/receipt_ref', at(('ui_response', 'receipt_ref'), new=thread2), True),
        ('goal.created/response/command_instance_id', at(('ui_response', 'command_instance_id'), new=other), True),
        ('goal.created/response/operation_id', at(('ui_response', 'operation_id'), new=other), True),
        ('goal.created/response/owner_identity', at(('ui_response', 'owner_identity', 'server_id'), new=other), True),
        ('goal.created/response/request_ref', at(('ui_response', 'request_ref'), new=other), True),
        ('goal.created/response/event_refs', at(('ui_response', 'event_refs'), new=['goal.created.v1:other']), True),
        ('goal.created/order/settlement_response', at(('ui_response', 'ts'), new='2026-09-12T08:00:04.9Z'), True),
    ]
    for field in ENVELOPE_NULLS:
        new = 7 if field == 'producer_sequence_id' else 'fixture:' + field
        out.append(('goal.created/envelope/null/' + field, at(('producer_input', field), new=new), True))
    return out


# --------------------------------------------------------------------------- 2. SP-298 reader

def V(event):
    """sha256 of the Storage canonical event value bytes (pm_event_numbers.storage_value_bytes,
    the shared SP-236 EVENT_VALUE profile); total: an unencodable value has no digest."""
    try:
        return hashlib.sha256(n.storage_value_bytes(event)).hexdigest()
    except n.Refusal:
        return None


def u64(value):
    try:
        n.storage_uint64(value)
        return True
    except n.Refusal:
        return False


def resource_bytes():
    return {name: path.read_bytes() for name, path in RESOURCE_FILES.items()}


def install_map(supported):
    support = c.load(PKG / 'support-map.json')
    if supported:  # TEST_ONLY installation: identical bindings/budget, roles installed
        support = copy.deepcopy(support)
        support['roles'] = {role: 'supported' for role in support['roles']}
    return support


def frame_receipt(event, locator):
    return dict(event_id=event['event_id'], sequence_id=event['sequence_id'], segment_generation=locator['segment_generation'],
                segment_name=locator['segment_name'], byte_offset=locator['byte_offset'], commit_group_id='fixture-group-12',
                durability_class='ordinary', durable_end_offset=locator['frame_end_offset'], durability_state='synced',
                manifest_generation=12, acknowledged_at_utc=event['persisted_at_utc'])


def reader_world():
    """TEST_ONLY world: the authored successful goal.created producer input, as the one matching
    frame between two nonmatching frames, under an exact current SP-278 snapshot."""
    fixture = c.load(PLANS / 'goal_start_command_contract_fixtures.json')
    record = next(x['value']['record'] for x in fixture['cases'] if x['id'] == 'successful_original_settlement_row')
    run = c.load(PLANS / 'run_started_consumer_contract_fixtures.json')['base']['event']
    project, storage = record['project_id'], record['storage_instance_id']
    created = dict(copy.deepcopy(record['producer_input']), sequence_id=52, observed_at_utc='2026-09-12T08:00:03Z',
                   persisted_at_utc='2026-09-12T08:00:04Z')
    before = dict(copy.deepcopy(run), project_id=project, sequence_id=51, observed_at_utc='2026-09-12T07:59:00Z',
                  persisted_at_utc='2026-09-12T07:59:00Z')
    after = dict(copy.deepcopy(run), project_id=project, sequence_id=53, event_id=run['event_id'] + ':later',
                 observed_at_utc='2026-09-12T08:01:00Z', persisted_at_utc='2026-09-12T08:01:00Z')
    frames = []
    offset = 0
    for event in (before, created, after):
        locator = dict(segment_generation=1, segment_name='seg-000001-00000000000000000051.active', byte_offset=offset,
                       frame_end_offset=offset + 1000)
        offset += 1000
        frames.append(dict(event=event, locator=locator, value_sha256=V(event), receipt=frame_receipt(event, locator),
                           commitment=dict(record['original_publication']['original_event_value_commitment'], sha256=V(event))))
    hexes = lambda ch: ch * 64
    selection = dict(storage_instance_id=storage, current_ref='storage/seglog/CURRENT', current_bytes_sha256=hexes('1'),
                     selected_segment_generation=1, manifest_ref='storage/seglog/manifest.v1.msgpack', manifest_bytes_sha256=hexes('2'),
                     manifest_generation=12, recovery_epoch=0, manifest_survivor_prefix_sha256=hexes('3'),
                     retained_inventory_sha256=hexes('4'), durable_watermarks_sha256=hexes('5'), excluded_ranges_sha256=hexes('6'),
                     retired_inputs_sha256=hexes('7'))
    token = dict(storage_instance_id=storage, checkpoint_key='event_record_index_checkpoint.v1:' + storage,
                 checkpoint_ref='event_record_index_checkpoint.v1:' + storage + '#/generations/eig_' + hexes('8'),
                 generation_id='eig_' + hexes('8'), generation_anchor_sha256=hexes('9'), frontier_revision=4,
                 frontier_sha256=hexes('a'), index_dataset_name='event_record_index.v2', source_selection=selection,
                 redb_snapshot_id='redb-snapshot:fixture-7')
    budget = dict(max_observations=8, max_examined_frames=16, max_source_bytes=1 << 20, max_decoded_value_bytes=1 << 20,
                  max_response_bytes=1 << 16)
    bodies = {json.dumps(record['body_commit']['receipt_request'], sort_keys=True): record['body_commit']['receipt_sha256']}
    support = install_map(True)
    return dict(storage_instance_id=storage, authority={project: True}, resources=resource_bytes(), support=support,
                current=copy.deepcopy(token), source=dict(token=copy.deepcopy(token), frames=frames), body_receipts=bodies,
                session=dict(issued={}), request=dict(reader_binding='storage.goal_created.current_read.v1@1.0.0',
                storage_instance_id=storage, project_id=project, budget=budget, cursor=None))


def issue_cursor(world, after_index):
    """An issued private cursor bound to the world's current snapshot, positioned after frame `after_index`."""
    frames = world['source']['frames']
    last = frames[after_index]
    def whole(f):  # SP278WholeLastFrame: the six coverage last-frame members
        return dict(segment_generation=f['locator']['segment_generation'], segment_name=f['locator']['segment_name'],
                    byte_offset=f['locator']['byte_offset'], frame_end_offset=f['locator']['frame_end_offset'],
                    last_sequence_id=f['event']['sequence_id'], last_event_id=f['event']['event_id'])
    frame, captured = whole(last), whole(frames[-1])
    handle = 'goal-created-page.v1:' + hashlib.sha256(b'fixture-session-handle').hexdigest()
    world['session']['issued'][handle] = dict(
        format_tag='pm.goal.created.cursor.v1', reader_binding='storage.goal_created.current_read.v1@1.0.0',
        contract_version='1.0.0', storage_instance_id=world['storage_instance_id'], project_id=world['request']['project_id'],
        budget=copy.deepcopy(world['request']['budget']), installed_reader_map_sha256=H(world['support']),
        route_contract_sha256=hashlib.sha256(world['resources']['contracts/pm.goal.created.routes.v1']).hexdigest(),
        sp278_read_token=copy.deepcopy(world['current']), captured_source_last_frame=captured, last_scanned_frame=frame,
        last_scanned_source_value_sha256=last['value_sha256'])
    world['request']['cursor'] = handle
    return handle


def pointer(value, path):
    for part in path.strip('/').split('/'):
        value = value[part]
    return value


def read(world):
    """SP-298 storage.goal_created.current_read.v1 over one complete world; returns refusal rows."""
    k = checks()
    g = c.Gates()
    request = world['request']
    errors = k.read_request(request)
    if errors:
        return errors
    resources = world['resources']
    bindings = c.load(PKG / 'resource-bindings.json')['resources']
    for row in bindings:
        data = resources.get(row['logical_resource'], b'')
        g.require('goal.created/reader/install/resource/' + row['binding_field'],
                  hashlib.sha256(data).hexdigest() == row['bytes_sha256'] and len(data) == row['byte_length'])
    support = world['support']
    g.require('goal.created/reader/install/support_bindings',
              support.get('bindings') == {row['binding_field']: row['bytes_sha256'] for row in bindings})
    g.require('goal.created/reader/install/role_current_page', support.get('roles', {}).get('current_page') == 'supported')
    if g.errors:
        return g.errors
    # The installed routes resource is byte-pinned above, so its reader binding and writer_authority=none are fixed.
    routes = json.loads(resources['contracts/pm.goal.created.routes.v1'])
    g.require('goal.created/reader/authority/storage', request['storage_instance_id'] == world['storage_instance_id'])
    g.require('goal.created/reader/authority/project', world['authority'].get(request['project_id']) is True)
    if g.errors:
        return g.errors
    token, current = world['source']['token'], world['current']
    errors = k.sp278_token(token)
    if errors:
        return errors
    g.require('goal.created/reader/admission/storage', token['storage_instance_id'] == request['storage_instance_id']
              == token['source_selection']['storage_instance_id'])
    g.require('goal.created/reader/admission/generation', token['generation_id'] == current['generation_id']
              and token['generation_anchor_sha256'] == current['generation_anchor_sha256'])
    g.require('goal.created/reader/admission/frontier', token['frontier_revision'] == current['frontier_revision']
              and token['frontier_sha256'] == current['frontier_sha256'])
    g.require('goal.created/reader/admission/dataset', token['index_dataset_name'] == current['index_dataset_name'])
    g.require('goal.created/reader/admission/source_selection', c.same_json_value(token['source_selection'], current['source_selection']))
    g.require('goal.created/reader/admission/snapshot', token['redb_snapshot_id'] == current['redb_snapshot_id'])
    frames = world['source']['frames']
    sequences = [f['event'].get('sequence_id') for f in frames]
    g.require('goal.created/reader/admission/frame_sequence', all(u64(x) for x in sequences))
    if not g.errors:
        g.require('goal.created/reader/admission/frame_order', all(a < b for a, b in zip(sequences, sequences[1:])))
    g.require('goal.created/reader/admission/frame_values', all(f['value_sha256'] is not None and f['value_sha256'] == V(f['event'])
                                                                for f in frames))
    if g.errors:
        return g.errors
    start = 0
    issued = world['session']['issued'].get(request['cursor']) if request['cursor'] is not None else None
    if request['cursor'] is not None:
        g.require('goal.created/reader/cursor/issued', issued is not None)
        if g.errors:
            return g.errors
    if issued is not None:  # (with the issued row cut, an unknown handle is ignored: a fresh scan)
        errors = k.cursor(issued)
        if errors:
            return errors
        g.require('goal.created/reader/cursor/scope', issued['storage_instance_id'] == request['storage_instance_id']
                  and issued['project_id'] == request['project_id'])
        g.require('goal.created/reader/cursor/budget', c.same_json_value(issued['budget'], request['budget']))
        bound = issued['sp278_read_token']
        for fact, fields in (('generation', ('generation_id', 'generation_anchor_sha256')),
                             ('frontier', ('frontier_revision', 'frontier_sha256')), ('dataset', ('index_dataset_name',)),
                             ('snapshot', ('redb_snapshot_id',)), ('checkpoint', ('checkpoint_key', 'checkpoint_ref'))):
            g.require('goal.created/reader/cursor/stale/' + fact, all(bound[x] == current[x] for x in fields))
        g.require('goal.created/reader/cursor/stale/source_selection', c.same_json_value(bound['source_selection'], current['source_selection']))
        g.require('goal.created/reader/cursor/stale/route', issued['route_contract_sha256']
                  == hashlib.sha256(resources['contracts/pm.goal.created.routes.v1']).hexdigest())
        g.require('goal.created/reader/cursor/stale/installed_map', issued['installed_reader_map_sha256'] == H(support))
        if g.errors:
            return g.errors
        last = issued['last_scanned_frame']
        position = next((i for i, f in enumerate(frames) if f['event']['event_id'] == last['last_event_id']
                         and f['event']['sequence_id'] == last['last_sequence_id']
                         and all(f['locator'][x] == last[x] for x in ('segment_generation', 'segment_name', 'byte_offset', 'frame_end_offset'))), None)
        g.require('goal.created/reader/cursor/last_frame', position is not None
                  and frames[position]['value_sha256'] == issued['last_scanned_source_value_sha256'])
        if g.errors:
            return g.errors
        start = position + 1
    budget = request['budget']
    route_by = {tuple(route[f] if f != 'schema_id' else route['envelope_schema_id'] for f in
                      ('schema_id', 'envelope_schema_version', 'scope_kind', 'event_type', 'payload_schema_id')): route
                for route in routes['routes']}
    observations, consumed, stop = [], 0, 'captured_boundary'
    for index in range(start, len(frames)):
        frame = frames[index]
        event = frame['event']
        if consumed >= budget['max_examined_frames']:
            stop = 'frame_limit'
            break
        matching = (event.get('event_type') == 'goal.created' and event.get('scope_kind') == 'project'
                    and event.get('project_id') == request['project_id'])
        if not matching:
            consumed += 1
            continue
        key = (event.get('schema_id'), event.get('schema_version'), event.get('scope_kind'), event.get('event_type'),
               event.get('payload_schema_id'))
        route = route_by.get(key)
        g.require('goal.created/reader/route/dispatch', route is not None)
        if g.errors:
            return g.errors
        if route is None:  # (dispatch row cut: the unsupported match would be skipped as nonmatching)
            consumed += 1
            continue
        v3 = route['disposition'] == 'active_v3_creation_observation'
        errors = (k.payload_v3 if v3 else k.payload_v2)(event['payload'])
        if errors:
            return errors
        receipt = frame['receipt']
        g.require('goal.created/reader/proof/first_receipt', receipt['event_id'] == event['event_id']
                  and receipt['sequence_id'] == event['sequence_id']
                  and all(receipt[x] == frame['locator'][x] for x in ('segment_generation', 'segment_name', 'byte_offset'))
                  and receipt['durable_end_offset'] == frame['locator']['frame_end_offset'])
        g.require('goal.created/reader/proof/full_value', frame['commitment']['sha256'] is not None
                  and frame['commitment']['sha256'] == V(event))
        if v3:
            body = world['body_receipts'].get(json.dumps(event['payload']['body_mutation_receipt_request'], sort_keys=True))
            g.require('goal.created/reader/proof/body_receipt', body == event['payload']['body_mutation_receipt_sha256'])
        if v3:
            g.require('goal.created/reader/route/current_integers',
                      all(current_int(event['payload'][x]) for x in ('goal_revision', 'accepted_objective_revision')))
        if g.errors:
            return g.errors
        observation = dict(event_id=event['event_id'], sequence_id=event['sequence_id'], payload_schema_id=event['payload_schema_id'],
                           project_id=event['project_id'], goal_id=pointer(event, route['observation_goal_pointer']),
                           thread_id=event['thread_id'], occurred_at_utc=event['occurred_at_utc'],
                           creation_goal_revision=pointer(event, route['observation_revision_pointer']))
        g.require('goal.created/reader/observation/payload_project', event['payload']['project_id'] == event['project_id'])
        if v3:
            g.require('goal.created/reader/observation/v3_thread', event['thread_id'] is not None
                      and event['payload']['thread_id'] == event['thread_id'])
        if g.errors:
            return g.errors
        if len(observations) >= budget['max_observations']:
            stop = 'observation_limit'
            break
        observations.append(observation)
        consumed += 1
    page = dict(reader_binding=request['reader_binding'], storage_instance_id=request['storage_instance_id'],
                project_id=request['project_id'], observations=observations, scan_complete=stop == 'captured_boundary',
                source_health='healthy', stop_reason=stop,
                next_cursor=None if stop == 'captured_boundary' else 'goal-created-page.v1:' + 'f' * 64, action_authority='none')
    # SP-298: pages use the primitive canonical MessagePack encoding (shared Storage value bytes), not RFC 8785.
    g.require('goal.created/reader/page/response_bytes', len(n.storage_value_bytes(page)) <= budget['max_response_bytes'])
    if g.errors:
        return g.errors
    for observation in observations:
        assert k.out['ObservationV1'].is_valid(observation), 'reader output self-check: observation'
    assert k.out['ReadPageV1'].is_valid(page), 'reader output self-check: page'
    return set()


def reader_witnesses(world):
    """(label, row, mutate(world)) single-defect reader negatives with their declared row."""
    def hexdigit(text, ch):
        return text[:-1] + (ch if text[-1:] != ch else '0')
    w = []
    for row in c.load(PKG / 'resource-bindings.json')['resources']:
        def tamper(x, name=row['logical_resource']):
            x['resources'][name] = x['resources'][name] + b' '
        w.append(('install/resource/' + row['binding_field'], 'goal.created/reader/install/resource/' + row['binding_field'], tamper))
    w += [
        ('install/support_bindings', 'goal.created/reader/install/support_bindings',
         lambda x: x['support']['bindings'].__setitem__('route_contract_sha256', '0' * 64)),
        ('install/supplied_support_map_unsupported', 'goal.created/reader/install/role_current_page',
         lambda x: x.__setitem__('support', install_map(False))),
        ('authority/request_for_another_store', 'goal.created/reader/authority/storage',
         lambda x: x.__setitem__('storage_instance_id', '22222222-2222-4222-8222-222222222222')),
        ('authority/unauthorized_project', 'goal.created/reader/authority/project',
         lambda x: x['authority'].__setitem__(x['request']['project_id'], False)),
        ('admission/token_storage', 'goal.created/reader/admission/storage',
         lambda x: x['source']['token'].__setitem__('storage_instance_id', '22222222-2222-4222-8222-222222222222')),
        ('admission/generation', 'goal.created/reader/admission/generation',
         lambda x: x['source']['token'].__setitem__('generation_anchor_sha256', 'b' * 64)),
        ('admission/frontier', 'goal.created/reader/admission/frontier',
         lambda x: x['source']['token'].__setitem__('frontier_revision', 5)),
        ('admission/dataset', 'goal.created/reader/admission/dataset',
         lambda x: x['source']['token'].__setitem__('index_dataset_name', 'event_record_index.v1')),
        ('admission/source_selection', 'goal.created/reader/admission/source_selection',
         lambda x: x['source']['token']['source_selection'].__setitem__('manifest_generation', 13)),
        ('admission/snapshot', 'goal.created/reader/admission/snapshot',
         lambda x: x['source']['token'].__setitem__('redb_snapshot_id', 'redb-snapshot:fixture-8')),
        ('admission/frame_order', 'goal.created/reader/admission/frame_order',
         lambda x: x['source']['frames'].__setitem__(slice(0, 2), list(reversed(x['source']['frames'][0:2])))),
        ('admission/frame_sequence', 'goal.created/reader/admission/frame_sequence',
         lambda x: coherent_frame(x, 2, lambda e: e.__setitem__('sequence_id', 53.0))),
        ('admission/frame_values', 'goal.created/reader/admission/frame_values',
         lambda x: x['source']['frames'][2].__setitem__('value_sha256', '0' * 64)),
        ('route/unknown_payload_route', 'goal.created/reader/route/dispatch',
         lambda x: coherent_frame(x, 1, lambda e: e.__setitem__('payload_schema_id', 'pm.goal_runtime_event.goal_created.schema.v4'))),
        ('proof/first_receipt', 'goal.created/reader/proof/first_receipt',
         lambda x: x['source']['frames'][1]['receipt'].__setitem__('byte_offset', 999)),
        ('proof/full_value', 'goal.created/reader/proof/full_value',
         lambda x: x['source']['frames'][1]['commitment'].__setitem__('sha256', '0' * 64)),
        ('proof/body_receipt', 'goal.created/reader/proof/body_receipt',
         lambda x: x.__setitem__('body_receipts', {})),
        ('page/response_bytes', 'goal.created/reader/page/response_bytes',
         lambda x: x['request']['budget'].__setitem__('max_response_bytes', 64)),
    ]
    return w


def coherent_frame(world, index, mutate):
    """Change a frame's event and keep every source proof coherent (value hash, receipt, commitment)."""
    frame = world['source']['frames'][index]
    mutate(frame['event'])
    frame['value_sha256'] = V(frame['event'])
    frame['receipt'] = frame_receipt(frame['event'], frame['locator'])
    frame['commitment']['sha256'] = V(frame['event'])


CURSOR_ROW = 'complete/owner_schema/Plans/goal_created_reader_contracts.schema.json#/$defs/IssuedPrivateGoalCreatedCursorV1'


def cursor_witnesses():
    return [
        ('cursor/not_issued', 'goal.created/reader/cursor/issued',
         lambda x: x['request'].__setitem__('cursor', 'goal-created-page.v1:' + 'e' * 64)),
        ('cursor/issued_without_captured_boundary', CURSOR_ROW,
         lambda x: next(iter(x['session']['issued'].values())).__setitem__('captured_source_last_frame', None)),
        ('cursor/scope', 'goal.created/reader/cursor/scope',
         lambda x: next(iter(x['session']['issued'].values())).__setitem__('project_id', 'project/other')),
        ('cursor/budget', 'goal.created/reader/cursor/budget', lambda x: x['request']['budget'].__setitem__('max_observations', 9)),
        ('cursor/stale/generation', 'goal.created/reader/cursor/stale/generation',
         lambda x: next(iter(x['session']['issued'].values()))['sp278_read_token'].__setitem__('generation_id', 'eig_' + '0' * 64)),
        ('cursor/stale/frontier', 'goal.created/reader/cursor/stale/frontier',
         lambda x: next(iter(x['session']['issued'].values()))['sp278_read_token'].__setitem__('frontier_revision', 3)),
        ('cursor/stale/dataset', 'goal.created/reader/cursor/stale/dataset',
         lambda x: next(iter(x['session']['issued'].values()))['sp278_read_token'].__setitem__('index_dataset_name', 'event_record_index.v1')),
        ('cursor/stale/snapshot', 'goal.created/reader/cursor/stale/snapshot',
         lambda x: next(iter(x['session']['issued'].values()))['sp278_read_token'].__setitem__('redb_snapshot_id', 'redb-snapshot:fixture-6')),
        ('cursor/stale/checkpoint', 'goal.created/reader/cursor/stale/checkpoint',
         lambda x: next(iter(x['session']['issued'].values()))['sp278_read_token'].__setitem__('checkpoint_ref', 'event_record_index_checkpoint.v1:other')),
        ('cursor/stale/source_selection', 'goal.created/reader/cursor/stale/source_selection',
         lambda x: next(iter(x['session']['issued'].values()))['sp278_read_token']['source_selection'].__setitem__('current_bytes_sha256', '0' * 64)),
        ('cursor/stale/route', 'goal.created/reader/cursor/stale/route',
         lambda x: next(iter(x['session']['issued'].values())).__setitem__('route_contract_sha256', '0' * 64)),
        ('cursor/stale/installed_map', 'goal.created/reader/cursor/stale/installed_map',
         lambda x: next(iter(x['session']['issued'].values())).__setitem__('installed_reader_map_sha256', '0' * 64)),
        ('cursor/last_frame_value', 'goal.created/reader/cursor/last_frame',
         lambda x: next(iter(x['session']['issued'].values())).__setitem__('last_scanned_source_value_sha256', '0' * 64)),
    ]


# --------------------------------------------------------------------------- 3. member resolver

def member(world):
    k = checks()
    g = c.Gates()
    request = world['request']
    errors = k.member_request(request)
    if errors:
        return errors
    mapping = json.loads(world['resources']['contracts/pm.goal.start.command_member_mapping.v1'])
    key = K(request['project_id'], request['thread_id'], request['command_instance_id'])
    suffixes = {m['logical_suffix']: m for m in mapping['mappings']}
    ref_key, _, suffix = request['member_ref'].partition('#')
    g.require('goal.created/member/ref_key', ref_key == key and '#' + suffix in suffixes)
    if g.errors:
        return g.errors
    g.require('goal.created/member/installed', mapping['reader_binding'] == request['reader_binding']
              and world['support'].get('roles', {}).get('original_command_member_resolution') == 'supported')
    g.require('goal.created/member/authority', world['authority'].get(request['project_id']) is True
              and request['storage_instance_id'] == world['storage_instance_id'])
    if g.errors:
        return g.errors
    row = world['rows'].get(key)
    g.require('goal.created/member/row_present', row is not None)
    if g.errors:
        return g.errors
    spec = suffixes['#' + suffix]
    value = None
    if row is not None:  # (row_present cut: no row, so no member value)
        errors = k.custody(row)
        if errors:
            return errors
        record = row['record']
        g.require('goal.created/member/row_identity', all(record[x] == request[x] for x in ('project_id', 'thread_id', 'command_instance_id'))
                  and record['storage_instance_id'] == request['storage_instance_id'])
        if g.errors:
            return g.errors
        phase = {'body_committed_pending': 'pending', 'terminal': 'terminal', 'terminal_unknown': 'terminal_unknown',
                 'terminal_no_effect': 'terminal_no_effect'}[record['phase']]
        g.require('goal.created/member/pending', phase != 'pending')
        if g.errors:
            return g.errors
        g.require('goal.created/member/phase', phase in spec['allowed_phases'])
        if g.errors:
            return g.errors
        value = row
        for part in spec['physical_json_pointer'].strip('/').split('/'):
            value = value.get(part) if isinstance(value, dict) else None
    g.require('goal.created/member/value_present', value is not None)
    if g.errors:
        return g.errors
    # Final disclosure boundary: the reply is the owner's closed typed member success (MemberSuccessV1,
    # whose value is GoalStartResultV2 or CreationReceipt by member suffix).
    reply = dict(status='resolved', member_ref=request['member_ref'], value=value, action_authority='none')
    g.require('goal.created/member/reply_schema', k.out['MemberSuccessV1'].is_valid(reply))
    return g.errors


def member_world(phase_case='successful_original_settlement_row', suffix='#/owner_result'):
    fixture = c.load(PLANS / 'goal_start_command_contract_fixtures.json')
    rows = {}
    for case in fixture['cases']:
        if case['expected'] == 'valid' and isinstance(case['value'], dict) and 'record' in case['value']:
            r = case['value']['record']
            rows.setdefault(case['id'], (K(r['project_id'], r['thread_id'], r['command_instance_id']), case['value']))
    key, row = rows[phase_case]
    r = row['record']
    return dict(storage_instance_id=r['storage_instance_id'], authority={r['project_id']: True}, resources=resource_bytes(),
                support=install_map(True), rows={key: copy.deepcopy(row)},
                request=dict(reader_binding='storage.goal_start_command.resolve_member.v1@1.0.0',
                             storage_instance_id=r['storage_instance_id'], project_id=r['project_id'], thread_id=r['thread_id'],
                             command_instance_id=r['command_instance_id'], member_ref=key + suffix))


# --------------------------------------------------------------------------- source

def main():
    collector = tables.COLLECTOR
    if collector is None:
        raise RuntimeError('Run through pm_goal_go_sweep.py')
    start = len(collector.failures)
    k = checks()
    fixture = c.load(PLANS / 'goal_start_command_contract_fixtures.json')
    counts = dict(authored=0, custody_witnesses=0, reader_witnesses=0, member_witnesses=0)
    by_schema = {'Plans/goal_start_command_custody.schema.json#': custody,
                 'Plans/goal_runtime_contracts.schema.json#/$defs/GoalStartResultV2': k.result,
                 'Plans/goal_runtime_contracts.schema.json#/$defs/GoalStartRequestV2': k.request,
                 'Plans/event_payloads/goal_runtime/goal_created.schema.json#': k.payload_v3}
    for case in fixture['cases']:
        evaluate = by_schema[case['schema_ref']]
        valid = case['expected'] == 'valid'
        target = None if valid else (k.custody.row if evaluate is custody else evaluate.row)
        collector.invoke('goal.created/authored/' + case['id'], evaluate, case['value'], valid, target=target, family=FAMILY)
        counts['authored'] += 1
    for name, evaluate in (('custody', custody), ('result', k.result), ('request', k.request), ('payload', k.payload_v3)):
        row = k.custody.row if evaluate is custody else evaluate.row
        collector.invoke('goal.created/schema-root-type/' + name, evaluate, None, False, target=row, family=FAMILY)
    base = next(case['value'] for case in fixture['cases'] if case['id'] == 'successful_original_settlement_row')
    for row, mutate, coherent in custody_witnesses():
        value = copy.deepcopy(base)
        mutate(value)
        if coherent:
            rehash(value)
        collector.invoke('goal.created/custody/single-defect/' + row.split('goal.created/', 1)[1], custody, value, False,
                         target=row, family=FAMILY)
        counts['custody_witnesses'] += 1
    # Pending and no-effect / unknown phases: every authored row is a control of the same boundary
    # above; a coherent copy edit on the pending row checks the joins that apply before settlement.
    pending = next(case['value'] for case in fixture['cases'] if case['id'] == 'pending_after_original_acknowledgement_row')
    for row, path in (('goal.created/payload/goal_id', ('producer_input', 'payload', 'goal_id')),
                      ('goal.created/envelope/actor', ('producer_input', 'actor_ref'))):
        value = copy.deepcopy(pending)
        node = value['record']
        for part in path[:-1]:
            node = node[part]
        node[path[-1]] += ':other'
        rehash(value)
        collector.invoke('goal.created/custody/pending-single-defect/' + row.split('goal.created/', 1)[1], custody, value, False,
                         target=row, family=FAMILY)
    # SP-298 reader.
    world = reader_world()
    collector.invoke('goal.created/reader/control/first_page', read, world, True, family=FAMILY)
    for label, row, mutate in reader_witnesses(world):
        value = copy.deepcopy(world)
        mutate(value)
        collector.invoke('goal.created/reader/single-defect/' + label, read, value, False, target=row, family=FAMILY)
        counts['reader_witnesses'] += 1
    for label, row, mutate in [
            ('observation/payload_project', 'goal.created/reader/observation/payload_project',
             lambda e: e['payload'].__setitem__('project_id', 'project/other')),
            ('observation/v3_thread', 'goal.created/reader/observation/v3_thread',
             lambda e: e['payload'].__setitem__('thread_id', 'thr_other')),
            ('route/payload_schema', 'complete/owner_schema/Plans/event_payloads/goal_runtime/goal_created.schema.json#',
             lambda e: e['payload'].__setitem__('goal_revision', 2)),
            ('route/current_integers', 'goal.created/reader/route/current_integers',
             lambda e: e['payload'].__setitem__('accepted_objective_revision', 1.0))]:
        value = copy.deepcopy(world)
        coherent_frame(value, 1, mutate)
        collector.invoke('goal.created/reader/single-defect/' + label, read, value, False, target=row, family=FAMILY)
        counts['reader_witnesses'] += 1
    resumed = copy.deepcopy(world)
    issue_cursor(resumed, 0)
    collector.invoke('goal.created/reader/control/resume_after_nonmatching', read, resumed, True, family=FAMILY)
    for label, row, mutate in cursor_witnesses():
        value = copy.deepcopy(resumed)
        mutate(value)
        collector.invoke('goal.created/reader/single-defect/' + label, read, value, False, target=row, family=FAMILY)
        counts['reader_witnesses'] += 1
    limited = copy.deepcopy(world)
    limited['request']['budget']['max_examined_frames'] = 1
    collector.invoke('goal.created/reader/control/frame_limit', read, limited, True, family=FAMILY)
    bad = copy.deepcopy(world)
    bad['request']['fixture_extra'] = True
    collector.invoke('goal.created/reader/single-defect/request_extra_member', read, bad, False,
                     target=k.read_request.row, family=FAMILY)
    bad = copy.deepcopy(world)
    for token in (bad['source']['token'], bad['current']):  # the source carries the store's own (malformed) facts
        token['generation_id'] = 'not-a-generation'
    collector.invoke('goal.created/reader/single-defect/token_schema', read, bad, False, target=k.sp278_token.row, family=FAMILY)
    # Package resources validate against their own adjacent schemas (whole definitions).
    for name, evaluate in (('routes.json', k.routes), ('command-members.json', k.members),
                           ('resource-bindings.json', k.bindings), ('schema-retrieval-bindings.json', k.retrieval),
                           ('support-map.json', k.support)):
        document = c.load(PKG / name)
        collector.invoke('goal.created/package/' + name, evaluate, document, True, family=FAMILY)
        collector.invoke('goal.created/package/root-type/' + name, evaluate, None, False, target=evaluate.row, family=FAMILY)
    # Member resolver.
    for case_id, suffix in (('successful_original_settlement_row', '#/owner_result'), ('successful_original_settlement_row', '#/creation_receipt'),
                            ('original_no_effect_failed_row', '#/owner_result'), ('original_unknown_body_row', '#/owner_result')):
        collector.invoke('goal.created/member/control/' + case_id + suffix, member, member_world(case_id, suffix), True, family=FAMILY)
    base_member = member_world()
    key = next(iter(base_member['rows']))
    member_cases = [
        ('ref_foreign_thread', 'goal.created/member/ref_key',
         lambda x: x['request'].__setitem__('member_ref', K(x['request']['project_id'], 'thr_2', x['request']['command_instance_id']) + '#/owner_result')),
        ('request_extra_member', k.member_request.row, lambda x: x['request'].__setitem__('fixture_extra', True)),
        ('supplied_support_map_unsupported', 'goal.created/member/installed', lambda x: x.__setitem__('support', install_map(False))),
        ('unauthorized_project', 'goal.created/member/authority', lambda x: x['authority'].__setitem__(x['request']['project_id'], False)),
        ('row_missing', ('goal.created/member/reply_schema', 'goal.created/member/row_present', 'goal.created/member/value_present'),
         lambda x: x.__setitem__('rows', {})),
        ('row_wrapper_extra_member', k.custody.row, lambda x: x['rows'][key]['record'].__setitem__('fixture_extra', True)),
        ('row_storage_identity', 'goal.created/member/row_identity',
         lambda x: x['request'].__setitem__('storage_instance_id', '22222222-2222-4222-8222-222222222222')
         or x.__setitem__('storage_instance_id', '22222222-2222-4222-8222-222222222222')),
    ]
    for label, row, mutate in member_cases:
        value = copy.deepcopy(base_member)
        mutate(value)
        collector.invoke('goal.created/member/single-defect/' + label, member, value, False, target=row, family=FAMILY)
        counts['member_witnesses'] += 1
    # Declared duplicate sets (defense in depth, SP-298 member role): a pending row is refused as
    # member_pending and, with that row cut, as a disallowed phase; a no-effect/unknown creation receipt
    # is refused as a disallowed phase and, with that cut, as an absent member.
    PHASE = ('goal.created/member/phase', 'goal.created/member/reply_schema', 'goal.created/member/value_present')
    for case_id, suffix, row in (('pending_after_original_body_row', '#/owner_result', ('goal.created/member/pending',) + PHASE),
                                 ('original_unknown_body_row', '#/creation_receipt', PHASE),
                                 ('original_no_effect_failed_row', '#/creation_receipt', PHASE)):
        collector.invoke('goal.created/member/single-defect/' + case_id + suffix, member, member_world(case_id, suffix), False,
                         target=row, family=FAMILY)
        counts['member_witnesses'] += 1
    value = member_world('successful_original_settlement_row', '#/creation_receipt')
    value['rows'][key]['record']['owner_result']['creation_receipt'] = None
    collector.invoke('goal.created/member/single-defect/creation_receipt_absent', member, value, False,
                     target=k.custody.row, family=FAMILY)
    GO_EVIDENCE.update(counts=counts, schema_roots=sorted(r for r in schemas.ROOTS if r.startswith('go:')))
    return int(len(collector.failures) > start)
