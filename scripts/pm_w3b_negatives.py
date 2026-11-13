"""W3B phase-2 positives and one-defect negatives (consumed by scripts/pm-w3b-cases.py).

Each negative names its base positive, the row that must refuse first, the phase-1 plan entries it witnesses and
the single defect it carries. It is either a rebuild of the base with one builder knob changed (every dependent
copy, key, digest and post-state recomputed by ``pm_w3b_cases_lib.build``; owner authority untouched) or the base
with one post-build change to a value nothing else is derived from. Owner-schema negatives are generated per
assertion site the base instance actually reaches (the W3B definitions and every inherited Source Control,
EventRecord, CV-339 and SP-278 assertion), so every identifier occurrence, embedded copies included, has its own
witness.
"""
from __future__ import annotations

import copy
import json
import re
from urllib.parse import urldefrag, urljoin

import msgpack

import pm_w3b_event_oracles as W
import pm_w3b_cases_lib as L

PLAN_FILE = W.ROOT / 'reports' / 'event-authority-20261105' / 'W3B-oracle-plan.json'
EV = W.PLANS_URI + W.EVENT_SCHEMA_FILE


def H(x):
    return L.H(x)


class Catalog:
    def __init__(self):
        self.positives, self.negatives, self.seals, self.implied = [], [], [], []
        self.base = {}
        self.ids = set()

    def pos(self, pid, scenario, plan=(), **meta):
        if pid in self.ids:
            raise ValueError('duplicate case ' + pid)
        self.ids.add(pid)
        sc = copy.deepcopy(scenario)
        sc.pop('_original', None)
        rec = {'id': pid, 'expect': 'accept', 'scenario': sc, 'plan': list(plan)}
        rec.update(meta)
        self.positives.append(rec)
        self.base[pid] = sc
        return sc

    def neg(self, nid, base_id, scenario, row, plan=(), defect=''):
        if nid in self.ids:
            raise ValueError('duplicate case ' + nid)
        self.ids.add(nid)
        sc = copy.deepcopy(scenario)
        sc.pop('_original', None)
        changes = L.diff(self.base[base_id], sc)
        if not changes:
            raise ValueError('negative without a change: ' + nid)
        self.negatives.append({'id': nid, 'base': base_id, 'changes': changes,
                               'expect': {'row': row, 'code': W.ROW_BY_ID[row]['code']}, 'plan': list(plan), 'defect': defect})

    def seal(self, original, recipe='w3b@1', admission_family=None, duplicate=False):
        o = copy.deepcopy(original)
        if duplicate:
            o['_duplicate'] = True
        self.seals.append((o, recipe, admission_family) if admission_family else (o, recipe))


def k(fam):
    return W.spec(fam)['key']


def pg(fam, name):
    return k(fam) + '/' + name


def post(sc, pointer, value, delete=False):
    out = copy.deepcopy(sc)
    W.apply_change(out, pointer, 'delete' if delete else 'set', None if delete else value)
    return out


def edit(sc, fn):
    out = copy.deepcopy(sc)
    fn(out)
    return out


def scope_of(req):
    """The legacy (or v2-wrapped) scope dict of an original request, for request knobs."""
    if req.get('variant') == 'legacy_exact':
        return req['legacy_request']['scope']
    return req['scope']['scope']


VARIANTS = {
    'backend.detected': ('partial', 'unavailable'), 'backend.selected': ('first',), 'remote.sync_completed': ('local',),
    'remote.sync_started': ('local',), 'writer_lease.granted': ('reconciled',), 'writer_lease.lost': ('expired', 'revoked'),
    'status.refreshed': ('partial', 'jj'), 'checkpoint.created': ('jj', 'jj_big'), 'checkpoint.restored': ('jj_big',),
    'workspace.opened': ('jj',), 'remote.fetch_completed': ('jj_big',), 'repository.bound': ('jj',), 'workspace.switched': ('jj_big',),
}
REVISION_FIELDS = ('checkpoint_revision', 'before_revision', 'after_revision', 'native_revision')
INT_SLOTS = {'checkpoint.created': 'checkpoint_generation', 'checkpoint.restored': 'checkpoint_generation',
             'repository.bound': 'binding_generation', 'repository.unbound': 'binding_generation',
             'writer_lease.granted': 'lease_generation', 'writer_lease.lost': 'lease_epoch'}


# ---------------------------------------------------------------------------------------------
# owner-schema assertion sites reached by a valid instance
# ---------------------------------------------------------------------------------------------
ASSERT_KW = ('type', 'const', 'enum', 'pattern', 'minLength', 'maxLength', 'minimum', 'maximum', 'format', 'uniqueItems',
             'minItems', 'maxItems')


def node_at(uri):
    base, frag = urldefrag(uri)
    return W.REGISTRY.resolver(base_uri=base).lookup('#' + frag).contents if frag else W.REGISTRY.resolver(base_uri=base).lookup(base).contents


def esc(x):
    return str(x).replace('~', '~0').replace('/', '~1')


def valid_at(uri, inst):
    with W.exact_digits():
        return W.validator_for(uri).is_valid(inst)


def walk_sites(uri, inst, iptr, out, seen):
    node = node_at(uri)
    if not isinstance(node, dict):
        return
    key = (uri, iptr)
    if key in seen:
        return
    seen.add(key)
    base, _ = urldefrag(uri)
    if '$ref' in node:
        target = urljoin(base, node['$ref'])
        if '#' not in target:
            target += '#'
        walk_sites(target, inst, iptr, out, seen)
    for kw in ASSERT_KW:
        if kw in node:
            out.append({'site': uri + '/' + kw, 'iptr': iptr, 'kw': kw, 'arg': node[kw], 'node': uri})
    if isinstance(inst, dict):
        for name in node.get('required', []):
            out.append({'site': uri + '/required/' + esc(name), 'iptr': iptr, 'kw': 'required', 'arg': name, 'node': uri})
        if node.get('additionalProperties') is False:
            out.append({'site': uri + '/additionalProperties', 'iptr': iptr, 'kw': 'additionalProperties', 'arg': False, 'node': uri})
        for name in node.get('properties', {}):
            if name in inst:
                walk_sites(uri + '/properties/' + esc(name), inst[name], iptr + '/' + esc(name), out, seen)
    if isinstance(inst, list) and 'items' in node and isinstance(node['items'], dict):
        for i, x in enumerate(inst):
            walk_sites(uri + '/items', x, iptr + '/' + str(i), out, seen)
    for i, _ in enumerate(node.get('allOf', [])):
        walk_sites(uri + '/allOf/' + str(i), inst, iptr, out, seen)
    for kw in ('oneOf', 'anyOf'):
        for i, _ in enumerate(node.get(kw, [])):
            if valid_at(uri + '/' + kw + '/' + str(i), inst):
                walk_sites(uri + '/' + kw + '/' + str(i), inst, iptr, out, seen)
    if 'if' in node:
        if valid_at(uri + '/if', inst):
            if 'then' in node:
                walk_sites(uri + '/then', inst, iptr, out, seen)
        elif 'else' in node:
            walk_sites(uri + '/else', inst, iptr, out, seen)


TYPE_SAMPLES = (('integer', 5), ('string', 'x'), ('array', []), ('object', {}), ('boolean', True), ('null', None), ('number', 1.5))


def json_type_ok(value, types):
    types = [types] if isinstance(types, str) else list(types)
    for t in types:
        if t == 'integer' and type(value) is int:
            return True
        if t == 'number' and type(value) in (int, float):
            return True
        if t == 'string' and type(value) is str:
            return True
        if t == 'array' and type(value) is list:
            return True
        if t == 'object' and type(value) is dict:
            return True
        if t == 'boolean' and type(value) is bool:
            return True
        if t == 'null' and value is None:
            return True
    return False


PATTERN_BREAKS = ('!{v}', '{v} x', ' {v}', '{v}!', 'G{v}', '-{v}', 'a\rb', '!', 'ZZ')


def mutations_for(site, value):
    """Candidate values that violate this assertion at this occurrence (first that the owner schema refuses wins)."""
    kw, arg = site['kw'], site['arg']
    if kw == 'type':
        return [v for t, v in TYPE_SAMPLES if not json_type_ok(v, arg)]
    if kw == 'const':
        if type(arg) is bool:
            return [not arg]
        if type(arg) is str:
            return [arg + 'x', arg.upper() if arg.upper() != arg else 'X' + arg]
        return ['x']
    if kw == 'enum':
        return ['zz_not_in_enum'] if all([type(x) is str for x in arg]) else [12345, 'zz']
    if kw == 'pattern' and type(value) is str:
        return [b.replace('{v}', value) for b in PATTERN_BREAKS]
    if kw == 'minLength' and type(value) is str:
        return ['' if arg >= 1 else None]
    if kw == 'maxLength' and type(value) is str:
        return [(value + 'a' * (arg + 1))[:arg + 1]]
    if kw == 'minimum' and type(value) is int:
        return [arg - 1]
    if kw == 'maximum' and type(value) is int:
        return [arg + 1]
    if kw == 'format' and arg == 'date-time':
        return ['2026-02-30T10:00:00Z']
    if kw == 'format' and arg == 'uuid':
        return ['not-a-uuid']
    if kw == 'uniqueItems' and arg is True and type(value) is list:
        return [value + value[:1]] if value else [['dup', 'dup']]
    if kw == 'minItems' and type(value) is list and arg >= 1:
        return [[]]
    if kw == 'maxItems' and type(value) is list:
        return [value + ['extra_' + str(i) for i in range(arg + 1 - len(value))] if len(value) <= arg else value]
    return []


def get_ptr(doc, iptr):
    node = doc
    for part in [p for p in iptr.split('/')[1:]]:
        part = part.replace('~1', '/').replace('~0', '~')
        node = node[int(part)] if type(node) is list else node[part]
    return node


TIME_BREAKS = (('missing-zone', '2026-11-05T10:15:30.123'), ('space-separator', '2026-11-05 10:15:30Z'),
               ('impossible-date', '2026-02-30T10:00:00Z'), ('hour-24', '2026-11-05T24:00:00Z'),
               ('trailing-lf', '2026-11-05T10:15:30Z\n'), ('false-leap', '2026-11-05T23:59:60Z'), ('empty-fraction', '2026-11-05T10:15:30.Z'))


def schema_negatives(C, fam, base_id, sc, subject_ptr, uri, schema_row, full_row, tag, plan_sites):
    """One negative per owner assertion site the base instance reaches under ``subject_ptr``; trailing-LF negatives at
    every pattern-bearing string (refused by the full-match row when the stock pattern search accepts them)."""
    inst = get_ptr(sc, subject_ptr)
    sites, seen = [], set()
    walk_sites(uri, inst, '', sites, seen)
    done = set()
    for s in sites:
        ident = (s['site'], s['iptr'], s['kw'])
        if ident in done:
            continue
        done.add(ident)
        target_ptr = subject_ptr + s['iptr']
        if s['kw'] == 'required':
            neg = post(sc, target_ptr + '/' + esc(s['arg']), None, delete=True)
            cands = [neg]
        elif s['kw'] == 'additionalProperties':
            cands = [post(sc, target_ptr + '/x_unknown_member', 'x')]
        else:
            value = get_ptr(sc, target_ptr)
            cands = [post(sc, target_ptr, m) for m in mutations_for(s, value) if m is not None or s['kw'] == 'type']
            if s['kw'] == 'format' and s['arg'] == 'date-time':
                cands = [post(sc, target_ptr, t) for _, t in TIME_BREAKS]
        hit = None
        accepted = []
        row_for = schema_row
        if subject_ptr == '/event/payload' and s['iptr'] == '' and s['kw'] == 'type':
            row_for = 'envelope_schema'
        for cand in cands:
            if not valid_at(uri, get_ptr(cand, subject_ptr)):
                hit = cand
                if s['kw'] == 'format':
                    label = [lb for lb, t in TIME_BREAKS if t == get_ptr(cand, target_ptr)]
                    nid = base_id + '/neg/' + tag + '/' + s['kw'] + '/' + (label[0] if label else 'x') + s['iptr'] + '@' + sitehash(s['site'])
                    C.neg(nid, base_id, cand, schema_row, plan=plan_sites.get(s['site'], ()) + (pg(fam, 'timestamp_owner_profile'),),
                          defect='owner schema ' + s['kw'] + ' at ' + target_ptr)
                    continue
                break
            accepted.append(get_ptr(cand, target_ptr) if s['kw'] not in ('required', 'additionalProperties') else s['kw'])
        if s['kw'] == 'format':
            if hit is None:
                C.implied.append({'family': fam, 'site': s['site'], 'instance': target_ptr, 'keyword': s['kw'], 'tried': accepted})
            continue
        if hit is None:
            if cands:
                C.implied.append({'family': fam, 'site': s['site'], 'instance': target_ptr, 'keyword': s['kw'], 'tried': [repr(a)[:60] for a in accepted]})
            continue
        nid = base_id + '/neg/' + tag + '/' + s['kw'] + s['iptr'] + ('/' + esc(s['arg']) if s['kw'] == 'required' else '') + '@' + sitehash(s['site'])
        C.neg(nid, base_id, hit, row_for, plan=plan_sites.get(s['site'], ()), defect='owner schema ' + s['kw'] + ' at ' + target_ptr)
        if s['kw'] == 'pattern':
            value = get_ptr(sc, target_ptr)
            if type(value) is str:
                lf = post(sc, target_ptr, value + '\n')
                stock_ok = valid_at(uri, get_ptr(lf, subject_ptr))
                row = full_row if stock_ok else schema_row
                C.neg(base_id + '/neg/' + tag + '/trailing-lf' + s['iptr'] + '@' + sitehash(s['site']), base_id, lf, row,
                      plan=(pg(fam, 'number_owner_rule'),)[:0], defect='trailing LF on a pattern-bearing identifier at ' + target_ptr)
    return sites


def sitehash(site):
    import hashlib
    return hashlib.sha256(site.encode('utf-8')).hexdigest()[:8]


def plan_site_map(fam):
    """Phase-1 plan schema entries keyed by their absolute site URI (local W3B definition sites)."""
    plan = json.loads(PLAN_FILE.read_text())
    out = {}
    for f in plan['families']:
        if f['event_type'] != fam:
            continue
        for g in f['guards']:
            if '/schema/' in g['guard']:
                out.setdefault(EV + g['schema_site'], ()).__class__
                out[EV + g['schema_site']] = out.get(EV + g['schema_site'], ()) + (g['guard'],)
    return out


def plan_entries(fam):
    plan = json.loads(PLAN_FILE.read_text())
    for f in plan['families']:
        if f['event_type'] == fam:
            return f['guards']
    return []


# ---------------------------------------------------------------------------------------------
# per-family catalog
# ---------------------------------------------------------------------------------------------
OTHER_FAMILY = {f: W.FAMILIES[(i + 1) % len(W.FAMILIES)] for i, f in enumerate(W.FAMILIES)}
UTC_BREAKS = (('offset-plus-zero', '+00:00'), ('lowercase-z', 'z'), ('offset-minus-zero', '-00:00'))


def utc_variant(t, zone):
    return t[:-1] + zone


def alt_value(fam, field, value):
    """A schema-valid different value for a payload field (the native owner keeps the original)."""
    enums = {'observation_state': {'backend.detected': ['complete', 'partial', 'unavailable'],
                                   'status.refreshed': ['current', 'partial', 'stale', 'unavailable']},
             'prior_state': {'writer_lease.granted': ['requested', 'reconciled']},
             'state': {'writer_lease.lost': ['released', 'expired_pending_reconciliation', 'revoked', 'quarantined']},
             'reconciliation_state': {'writer_lease.lost': ['not_required', 'pending', 'observing', 'clean', 'conflicted',
                                                            'manual_recovery_required']},
             'sync_variant': {}}
    s = L.short(fam)
    if field in enums and s in enums[field]:
        return [x for x in enums[field][s] if x != value][0]
    if field == 'detected_backends':
        return ['git'] if value != ['git'] else ['jujutsu']
    if field in ('previous_backend', 'selected_backend', 'scm_backend'):
        return 'git' if value != 'git' else 'jujutsu'
    if field in REVISION_FIELDS:
        return L.git_rev('alt') if value.get('kind') == 'git' else L.jj_rev('alt')
    if type(value) is int:
        return value + 1
    if type(value) is str:
        return value + '.alt'
    raise ValueError((fam, field, value))


LINEAGE_REQ = ('project_id', 'execution_host_id', 'execution_environment_id', 'source_location_id')
SCOPE_REQ = ('repo_id', 'scm_backend', 'workspace_id', 'repository_context_ref')


def mirror_request(field, value):
    """The accepted request carries copies of some payload fields: change them together (one coherent value)."""
    def fn(req):
        if req is None:
            return req
        sc = scope_of(req)
        if field in LINEAGE_REQ:
            sc['lineage'][field] = value
        if field in SCOPE_REQ and field in sc:
            sc[field] = value
            if field == 'scm_backend':
                sc['expected_revision'] = L.jj_rev('head') if value == 'jujutsu' else L.git_rev('head')
        if req.get('command_id') == 'cmd.source_control.remote.sync':
            if field == 'project_id':
                req['target']['project_id'] = value
            if field == 'scm_backend':
                req['target']['backend'] = value
        return req
    return fn


def family(C, fam):
    kid, s = k(fam), L.short(fam)
    sp = W.spec(fam)
    B = L.build(fam)
    A = L.append_case(B)
    base = kid + '/append/base'
    C.pos(base, A, plan=[pg(fam, x) for x in ('admission', 'schema_dispatch', 'project_scope', 'original_acceptance',
                                              'before_effect_authority', 'retention_pending')], long_integer_base=True,
          payload_int_slot=INT_SLOTS.get(s))

    def nb(**knobs):
        return L.append_case(L.build(fam, **knobs))

    def N(label, scenario, row, plan=(), defect='', base_id=base):
        C.neg(base_id + '/neg/' + label, base_id, scenario, row, plan=tuple(plan), defect=defect)

    def resync(scenario):
        sc2 = copy.deepcopy(scenario)
        sc2['_original'] = copy.deepcopy(B['_original'])
        L.resync_event(sc2)
        return L.append_case(sc2)

    # variants and owner-valid boundary positives ---------------------------------------------------------
    for v in VARIANTS.get(s, ()):
        C.pos(kid + '/append/' + v, L.append_case(L.build(fam, variant=v)))
    LE = L.append_case(L.build(fam, long_evidence=True))
    C.pos(kid + '/append/source-pack', LE, plan=[pg(fam, 'stored_wrapper_size'), pg(fam, 'source_body_route')])
    C.pos(kid + '/append/sequence-u64-max', nb(event_over={'sequence_id': 2 ** 64 - 1}), plan=[pg(fam, 'number_owner_rule')])
    C.pos(kid + '/append/producer-2p53', nb(event_over={'producer_sequence_id': 2 ** 53}), plan=[pg(fam, 'number_owner_rule')])
    for label, t in (('lowercase-t-z', '2026-11-05t10:15:30.123z'), ('offset', '2026-11-05T12:15:30.123+02:00'),
                     ('leap-second', '2016-12-31T23:59:60Z'), ('long-fraction', '2026-11-05T10:15:30.123456789012Z')):
        C.pos(kid + '/append/occurred-' + label, nb(event_over={'occurred_at_utc': t}, op_over={'occurred_at_utc': t}),
              plan=[pg(fam, 'timestamp_owner_profile')])

    # scenario and install ---------------------------------------------------------------------------------
    N('scenario-path', post(A, '/path', 'replay'), 'scenario_path')
    N('scenario-family', post(A, '/family', 'source_control.unknown_family'), 'scenario_family')
    N('event-family', post(A, '/event/event_type', OTHER_FAMILY[fam]), 'event_family')
    I = C.pos(kid + '/install/base', L.install_case(fam), plan=[pg(fam, 'refs_resolve')])
    N('install-dangling-ref', post(I, '/resource_changes', [['/' + W.EVENT_SCHEMA_FILE + '/$defs/' + kid + '_source_body', 'delete']]),
      'install_refs', plan=[pg(fam, 'refs_resolve')], base_id=kid + '/install/base')
    N('install-metaschema', post(I, '/resource_changes', [['/' + W.EVENT_SCHEMA_FILE + '/$defs/' + kid + '_checkpoint/type', 'set', 5]]),
      'install_metaschema', plan=[pg(fam, 'refs_resolve')], base_id=kid + '/install/base')

    # envelope -----------------------------------------------------------------------------------------------
    N('envelope-missing-actor', post(A, '/event/actor_ref', None, delete=True), 'envelope_schema')
    for label, t in TIME_BREAKS:
        N('occurred-' + label, post(A, '/event/occurred_at_utc', t), 'envelope_schema', plan=[pg(fam, 'timestamp_owner_profile')])
    N('sequence-integral-float', post(A, '/event/sequence_id', float(L.SEQ)), 'envelope_numbers', plan=[pg(fam, 'number_owner_rule')])
    N('producer-sequence-integral-float', post(A, '/event/producer_sequence_id', 7.0), 'envelope_numbers', plan=[pg(fam, 'number_owner_rule')])
    N('producer-sequence-negative-zero-float', post(A, '/event/producer_sequence_id', -0.0), 'envelope_numbers',
      plan=[pg(fam, 'number_owner_rule')])
    N('sequence-string-number', post(A, '/event/sequence_id', '4211'), 'envelope_schema', plan=[pg(fam, 'number_owner_rule')])
    N('sequence-bool', post(A, '/event/sequence_id', True), 'envelope_schema', plan=[pg(fam, 'number_owner_rule')])
    N('sequence-2p64', post(A, '/event/sequence_id', 2 ** 64), 'sequence_u64', plan=[pg(fam, 'number_owner_rule')])
    N('producer-sequence-2p53-plus-1', resync(post(A, '/event/producer_sequence_id', 2 ** 53 + 1)), 'producer_route',
      plan=[pg(fam, 'number_owner_rule')])
    for fld in ('observed_at_utc', 'persisted_at_utc'):
        t0 = A['event'][fld]
        for label, zone in UTC_BREAKS:
            N(fld + '-' + label, post(A, '/event/' + fld, utc_variant(t0, zone)), 'storage_utc_z_' + fld,
              plan=[pg(fam, 'timestamp_owner_profile')])
    N('payload-schema-id', post(A, '/event/payload_schema_id', W.spec(OTHER_FAMILY[fam])['payload_schema_id']), 'payload_schema_id',
      plan=[pg(fam, 'schema_dispatch')])
    N('application-scope', edit(A, lambda x: x['event'].update({'scope_kind': 'application', 'project_id': None})), 'scope_project_only',
      plan=[pg(fam, 'application_scope_refusal')])

    # payload numbers / producer route / packs -----------------------------------------------------------------
    slot = INT_SLOTS.get(s)
    rev = [f for f in REVISION_FIELDS if f in A['event']['payload']]
    int_ptrs = (['/' + slot] if slot else []) + ['/' + f + '/index_generation' for f in rev if A['event']['payload'][f]['kind'] == 'git']
    for ptr in int_ptrs[:2]:
        val = get_ptr(A, '/event/payload' + ptr)
        N('payload-integral-float' + ptr, post(A, '/event/payload' + ptr, float(val)), 'payload_numbers', plan=[pg(fam, 'number_owner_rule')])
        N('payload-2p60' + ptr, resync(post(A, '/event/payload' + ptr, 2 ** 60)), 'producer_route', plan=[pg(fam, 'number_owner_rule')])
        N('payload-2p53-plus-1' + ptr, resync(post(A, '/event/payload' + ptr, 2 ** 53 + 1)), 'producer_route', plan=[pg(fam, 'number_owner_rule')])
        N('payload-string-number' + ptr, post(A, '/event/payload' + ptr, str(val)), 'payload_schema', plan=[pg(fam, 'number_owner_rule')])
        N('payload-bool' + ptr, post(A, '/event/payload' + ptr, True), 'payload_schema', plan=[pg(fam, 'number_owner_rule')])
    if 'jj_big' in VARIANTS.get(s, ()):
        bid = kid + '/append/jj_big'
        J = C.base[bid]
        pk = J['pack']
        N('inline-oversize', edit(J, lambda x: x.update({'pack': None, 'durable_packs': x['durable_packs'][1:]}) or
                                  x['event'].update({'payload_ref': None})), 'inline_size', plan=[pg(fam, 'event_body_size')], base_id=bid)
        N('pack-route', post(J, '/event/payload_ref', 'sp337:blake3:' + H('other-pack')), 'pack_route',
          plan=[pg(fam, 'payload_pack_identity')], base_id=bid)
        N('pack-size', post(J, '/pack/byte_size', pk['byte_size'] + 1), 'pack_size', plan=[pg(fam, 'payload_pack_identity')], base_id=bid)

        def other_id(x):
            nid_ = H('forged-id')
            x['pack']['payload_id'] = nid_
            x['event']['payload_ref'] = 'sp337:blake3:' + nid_
            x['durable_packs'][0] = nid_
        N('pack-blake3', edit(J, other_id), 'pack_blake3', plan=[pg(fam, 'payload_pack_identity')], base_id=bid)
        N('pack-media', post(J, '/pack/media_type', 'application/octet-stream'), 'pack_media', plan=[pg(fam, 'payload_pack_identity')], base_id=bid)

        def other_body(x):
            alt = copy.deepcopy(x['event']['payload'])
            alt['execution_environment_id'] = 'env.other'
            p2 = L.make_pack(alt, L.PACK_MEDIA)
            x['pack'] = p2
            x['event']['payload_ref'] = 'sp337:blake3:' + p2['payload_id']
            x['durable_packs'][0] = p2['payload_id']
        N('pack-body', edit(J, other_body), 'pack_body', plan=[pg(fam, 'payload_pack_identity')], base_id=bid)
        N('pack-not-durable', edit(J, lambda x: x.update({'durable_packs': x['durable_packs'][1:]})), 'pack_durable',
          plan=[pg(fam, 'payload_pack_durable')], base_id=bid)

    def small_ref(x):
        p2 = L.make_pack(x['event']['payload'], L.PACK_MEDIA)
        x['pack'] = p2
        x['event']['payload_ref'] = 'sp337:blake3:' + p2['payload_id']
        x['durable_packs'] = [p2['payload_id']]
    N('pack-small-body-referenced', edit(A, small_ref), 'pack_needed', plan=[pg(fam, 'event_body_size')])

    # identity, writer, lineage ------------------------------------------------------------------------------
    N('event-id-substituted', nb(eid_over='evt_scs_' + kid + '_substituted'), 'event_identity', plan=[pg(fam, 'event_id_recipe')])
    N('key-substituted', nb(ikey_over='scs:' + kid + ':substituted'), 'key_recipe', plan=[pg(fam, 'idempotency_key_recipe')])
    N('raw-project-partition', post(A, '/target/scope_partition', L.PROJECT), 'target_partition', plan=[pg(fam, 'project_scope')])
    N('other-storage-target', post(A, '/target/storage_instance_id', L.OTHER_SID), 'target_storage')
    N('producer-substituted', post(A, '/producer', 'SourceControlOperationCoordinator / handlers::source_control::other'), 'producer_identity')
    N('admission-missing', post(A, '/admission/writer_granted', False), 'admission_grant', plan=[pg(fam, 'admission')])
    N('admission-sibling', post(A, '/admission/family', OTHER_FAMILY[fam]), 'admission_family', plan=[pg(fam, 'admission')])
    N('admission-version', post(A, '/admission/version', '2.0.0'), 'admission_version', plan=[pg(fam, 'admission'), pg(fam, 'unknown_version')])
    N('withdrawn-cutoff', post(A, '/admission/writer_withdrawn', True), 'writer_withdrawn', plan=[pg(fam, 'withdrawal_cutoff')])
    N('retention-pending', post(A, '/admission/retention_policy_ref', 'PENDING_RETENTION_DECISION'), 'retention_bound',
      plan=[pg(fam, 'retention_pending')])
    wrong = 'RP-AUTHORITY-INDEFINITE@1.0.0' if sp['retention'][1] != 'RP-AUTHORITY-INDEFINITE@1.0.0' else 'RP-TELEMETRY-90D@1.0.0'
    N('retention-inherited', post(A, '/admission/retention_policy_ref', wrong), 'retention_bound', plan=[pg(fam, 'retention_pending')])
    N('replay-only-current', resync(post(A, '/event/replay_policy', 'projector_replay_only')), 'replay_only',
      plan=[pg(fam, 'normal_replay_only_refusal')])
    N('replay-policy-append-once', resync(post(A, '/event/replay_policy', 'append_once')), 'replay_policy_family')
    other = {'thread_id': 'thr.other', 'run_id': 'run.other', 'node_id': 'node.other', 'attempt_id': 'att.other', 'actor_ref': 'actor:user:u2',
             'requested_account_ref': 'acct:req:u2', 'effective_account_ref': 'acct:eff:u2', 'correlation_id': 'corr.other',
             'causation_event_id': 'evt.cause.other', 'parent_event_id': 'evt.parent.other'}
    for fld in W.LINEAGE_FIELDS:
        N('lineage-' + fld, resync(post(A, '/event/' + fld, other[fld])), 'lineage_' + fld)
    N('occurred-not-source-time', resync(post(A, '/event/occurred_at_utc', '2026-11-05T10:15:31.000Z')), 'occurred_source')
    N('redaction-profile', resync(post(A, '/event/redaction_profile', 'redacted')), 'envelope_redaction', plan=[pg(fam, 'no_secret')])
    N('migration-lineage', resync(post(A, '/event/migration/migration_id', 'mig.1')), 'envelope_migration')

    # fact ---------------------------------------------------------------------------------------------------
    N('fact-missing', post(A, '/fact', None), 'fact_present', plan=[pg(fam, 'first_receipt_missing')])
    N('fact-not-object', post(A, '/fact', []), 'fact_schema')
    N('fact-both-routes', post(A, '/fact/source_body_ref', {'blake3_id': H('x'), 'byte_size': 10, 'media_type': L.SOURCE_MEDIA}),
      'fact_schema', plan=[pg(fam, 'source_body_route')])
    N('fact-no-route', post(A, '/fact/source_body', None), 'fact_schema', plan=[pg(fam, 'source_body_route')])
    N('fact-committed-with-receipt', post(A, '/fact/first_append_receipt_ref', 'sp286:first_receipt:x'), 'fact_schema',
      plan=[pg(fam, 'source_phase_cas')])
    N('fact-issued-without-receipt', post(A, '/fact/phase', 'issued'), 'fact_schema', plan=[pg(fam, 'source_phase_cas')])
    req0 = A['fact']['source_body']['original_request']
    if req0 is not None and req0.get('variant') == 'legacy_exact':
        N('fact-request-topology-float', post(A, '/fact/source_body/original_request/legacy_request/scope/lineage/topology_generation', 4.0),
          'fact_numbers', plan=[pg(fam, 'number_owner_rule')])
        for label, t in TIME_BREAKS:
            N('requested-at-' + label, post(A, '/fact/source_body/original_request/legacy_request/requested_at_utc', t), 'fact_schema',
              plan=[pg(fam, 'timestamp_owner_profile')])
    if slot:
        N('fact-payload-copy-float', post(A, '/fact/source_body/payload/' + slot, float(A['fact']['source_body']['payload'][slot])),
          'fact_numbers', plan=[pg(fam, 'number_owner_rule')])
    N('fact-key-substituted', post(A, '/fact_key', 'source_control_event.' + kid + '.fact.v1:00'), 'fact_key_recipe')
    lid = kid + '/append/source-pack'
    sref = LE['fact']['source_body_ref']
    body = W.decode_storage_value(bytes.fromhex(LE['source_pack']['bytes_hex']), profile=W.EVENT_VALUE)
    N('source-inline-oversize', edit(LE, lambda x: x['fact'].update({'source_body': copy.deepcopy(body), 'source_body_ref': None})),
      'fact_wrapper_size', plan=[pg(fam, 'stored_wrapper_size')], base_id=lid)
    N('source-pack-missing', post(LE, '/source_pack', None), 'src_pack_present', plan=[pg(fam, 'source_body_route')], base_id=lid)
    N('source-pack-size', post(LE, '/fact/source_body_ref/byte_size', sref['byte_size'] + 1), 'src_pack_size',
      plan=[pg(fam, 'payload_pack_identity')], base_id=lid)
    N('source-pack-blake3', post(LE, '/fact/source_body_ref/blake3_id', H('forged-source-pack')), 'src_pack_blake3',
      plan=[pg(fam, 'payload_pack_identity')], base_id=lid)
    N('source-pack-media', post(LE, '/fact/source_body_ref/media_type', 'application/octet-stream'), 'src_pack_media',
      plan=[pg(fam, 'payload_pack_identity')], base_id=lid)

    def with_pack_bytes(raw):
        def fn(x):
            import blake3 as _b3
            x['source_pack']['bytes_hex'] = raw.hex()
            x['fact']['source_body_ref'].update({'blake3_id': _b3.blake3(raw).hexdigest(), 'byte_size': len(raw)})
            x['durable_packs'] = [d for d in x['durable_packs'] if d != sref['blake3_id']] + [_b3.blake3(raw).hexdigest()]
        return fn
    reordered = dict(reversed(list(body.items())))
    N('source-pack-noncanonical', edit(LE, with_pack_bytes(msgpack.packb(reordered, use_bin_type=True))), 'src_pack_decodes',
      plan=[pg(fam, 'payload_pack_identity')], base_id=lid)
    bad_body = copy.deepcopy(body)
    del bad_body['original_owner_result_ref']
    N('source-pack-body-schema', edit(LE, with_pack_bytes(L.vbytes(bad_body))), 'src_body_schema', plan=[pg(fam, 'source_body_route')],
      base_id=lid)
    lf_body = copy.deepcopy(body)
    lf_body['original_owner_result_ref'] += '\n'
    N('source-pack-body-trailing-lf', edit(LE, with_pack_bytes(L.vbytes(lf_body))), 'src_body_fullmatch', base_id=lid)
    num_body = copy.deepcopy(body)
    if num_body['original_request'] is not None and num_body['original_request'].get('variant') == 'legacy_exact':
        num_body['original_request']['legacy_request']['scope']['lineage']['topology_generation'] = 4.0
    else:
        num_body['payload'][slot or 'lease_generation'] = float(num_body['payload'][slot or 'lease_generation'])
    N('source-pack-body-integral-float', edit(LE, with_pack_bytes(L.vbytes(num_body))), 'src_body_numbers',
      plan=[pg(fam, 'number_owner_rule')], base_id=lid)
    N('source-pack-not-durable', edit(LE, lambda x: x.update({'durable_packs': [d for d in x['durable_packs'] if d != sref['blake3_id']]})),
      'src_pack_durable', plan=[pg(fam, 'payload_pack_durable')], base_id=lid)

    def small_source_ref(x):
        b = x['fact']['source_body']
        raw = L.vbytes(b)
        import blake3 as _b3
        x['source_pack'] = {'bytes_hex': raw.hex()}
        x['fact']['source_body'] = None
        x['fact']['source_body_ref'] = {'blake3_id': _b3.blake3(raw).hexdigest(), 'byte_size': len(raw), 'media_type': L.SOURCE_MEDIA}
        x['durable_packs'] = [_b3.blake3(raw).hexdigest()]
        L.resync_fact_after(_with_orig(x, B))
        x.pop('_original', None)
    N('source-small-body-referenced', edit(A, small_source_ref), 'src_pack_needed', plan=[pg(fam, 'stored_wrapper_size')])

    # copies --------------------------------------------------------------------------------------------------
    N('event-payload-copy', resync(post(A, '/event/payload/execution_environment_id', 'env.other')), 'payload_copy')

    def env_project(x):
        x['event']['project_id'] = 'proj.other'
        x['target']['scope_partition'] = L.partition('proj.other')
    N('envelope-project-copy', resync(edit(A, env_project)), 'envelope_project_copy')
    N('fact-other-storage', nb(fact_sid=L.OTHER_SID), 'fact_storage')
    N('fact-project-copy', nb(fact_project='proj.other'), 'fact_project_copy')
    N('fact-operation-copy', nb(fact_op='op.other.9'), 'fact_operation_copy')

    def fact_change(field, value):
        def fn(x):
            x['fact'][field] = value
            L.resync_fact_after(_with_orig(x, B))
            x.pop('_original', None)
        return fn
    N('fact-event-copy', edit(A, fact_change('event_id', 'evt_scs_other')), 'fact_event_copy')
    N('fact-key-copy', edit(A, fact_change('idempotency_key', 'scs:other')), 'fact_key_copy')
    N('source-fact-ref', nb(payload_over={'source_fact_ref': 'source_control_event.' + kid + '.fact.v1:other'}), 'source_fact_ref',
      plan=[pg(fam, 'source_join/source_fact_ref')])

    # acceptance ------------------------------------------------------------------------------------------------
    N('acceptance-missing', post(A, '/owner/operation/accepted', False), 'acceptance_present', plan=[pg(fam, 'original_acceptance')])
    N('acceptance-caller-fixture', post(A, '/owner/operation/source_commitment', H('caller-fixture')), 'acceptance_commitment',
      plan=[pg(fam, 'original_acceptance')])
    N('source-operation', nb(payload_over={'owner_operation_id': 'op.' + kid + '.caller'}), 'source_join_owner_operation_id',
      plan=[pg(fam, 'source_join/owner_operation_id')])
    N('owner-result-ref', nb(body_over={'original_owner_result_ref': 'result:other:1'}), 'owner_result_ref')
    N('native-evidence', nb(body_over={'native_evidence_refs': ['native:other:1']}), 'native_evidence')
    secret_refs = list(B['owner']['operation']['native_evidence_refs']) + ['native:evidence:access_token=abc123']
    N('secret-material', nb(body_over={'native_evidence_refs': secret_refs}, op_over={'native_evidence_refs': secret_refs}), 'no_secret',
      plan=[pg(fam, 'no_secret')])

    # original request ------------------------------------------------------------------------------------------
    if sp['command_id']:
        request_negatives(C, fam, B, A, base, nb, N)

    # source joins ------------------------------------------------------------------------------------------------
    for fld in W.payload_fields(fam):
        if fld in W.SOURCE_JOIN_SKIP:
            if fld in ('schema_id', 'schema_version'):
                N('source-' + fld, post(A, '/event/payload/' + fld, A['event']['payload'][fld] + 'x'), 'payload_schema',
                  plan=[pg(fam, 'source_join/' + fld)])
            continue
        fschema = W.resources()[W.EVENT_SCHEMA_FILE]['$defs'][kid + '_payload']['properties'][fld]
        if 'const' in fschema:
            N('source-' + fld + '-const', post(A, '/event/payload/' + fld, fschema['const'] + '_other'), 'payload_schema',
              plan=[pg(fam, 'source_join/' + fld)])
            continue
        if fld == 'sync_variant':
            N('source-sync-variant', L.append_case(L.build(fam, variant='local', native_over={'sync_variant': 'remote_effect'})),
              'source_join_sync_variant', plan=[pg(fam, 'source_join/sync_variant')])
            continue
        alt = alt_value(fam, fld, B['owner']['native'][fld])
        N('source-' + fld, nb(payload_over={fld: alt}, request_fn=mirror_request(fld, alt)), 'source_join_' + fld,
          plan=[pg(fam, 'source_join/' + fld)])

    # before-effect authority --------------------------------------------------------------------------------------
    for kind in sp['authorities']:
        extra_plan = [pg(fam, 'transition/1')] if s == 'checkpoint.restored' and kind in ('permission', 'filesafe') else []
        N('authority-' + kind + '-denied', post(A, '/owner/authority/' + kind + '/decision', 'deny'), 'auth_' + kind + '_allow',
          plan=[pg(fam, 'before_effect_authority')] + extra_plan)
        N('authority-' + kind + '-stale', post(A, '/owner/current_generation/' + kind, A['owner']['current_generation'][kind] + 1),
          'auth_' + kind + '_current', plan=[pg(fam, 'before_effect_authority')])

    if s == 'checkpoint.restored':
        N('restore-not-confirmed', post(A, '/fact/source_body/original_request/legacy_request/scope/restore_confirmation', False), 'fact_schema',
          plan=[pg(fam, 'transition/1')])

    # publication and CAS --------------------------------------------------------------------------------------------
    N('storage-sequence', resync(post(A, '/event/sequence_id', L.SEQ + 1)), 'storage_sequence_id', plan=[pg(fam, 'storage_metadata_custody')])
    N('storage-observed', resync(post(A, '/event/observed_at_utc', '2026-11-05T10:15:30.500Z')), 'storage_observed_at_utc',
      plan=[pg(fam, 'storage_metadata_custody')])
    N('storage-persisted', resync(post(A, '/event/persisted_at_utc', '2026-11-05T10:15:30.800Z')), 'storage_persisted_at_utc',
      plan=[pg(fam, 'storage_metadata_custody')])
    N('custody-other-storage', post(A, '/publication/custody/storage_instance_id', L.OTHER_SID), 'custody_storage')
    N('custody-other-event', post(A, '/publication/custody/event_id', 'evt_scs_other'), 'custody_event')
    N('receipt-durability', post(A, '/publication/custody/receipt/durability_state', 'pending'), 'receipt_schema')
    for label, t in TIME_BREAKS:
        N('receipt-ack-' + label, post(A, '/publication/custody/receipt/acknowledged_at_utc', t), 'receipt_schema',
          plan=[pg(fam, 'timestamp_owner_profile')])
    N('receipt-offset-float', post(A, '/publication/custody/receipt/byte_offset', 1024.0), 'receipt_numbers', plan=[pg(fam, 'number_owner_rule')])
    N('receipt-segment-2p64', post(A, '/publication/custody/receipt/segment_generation', 2 ** 64), 'receipt_u64',
      plan=[pg(fam, 'number_owner_rule')])
    N('receipt-not-issued', post(A, '/publication/custody/receipt/byte_offset', 2048), 'receipt_storage', plan=[pg(fam, 'storage_metadata_custody')])

    def other_receipt_event(x):
        x['publication']['custody']['receipt']['event_id'] = 'evt_scs_other'
        x['storage_issued']['receipt']['event_id'] = 'evt_scs_other'
    N('receipt-other-event', edit(A, other_receipt_event), 'receipt_event')
    N('custody-full-value', post(A, '/publication/custody/full_value_sha256', H('supplied')), 'custody_full_value',
      plan=[pg(fam, 'first_receipt_full_value')])
    N('custody-producer', post(A, '/publication/custody/producer_semantic_sha256', H('supplied')), 'custody_producer',
      plan=[pg(fam, 'first_receipt_full_value')])

    def issued_fact(x):
        ref = L.receipt_ref(L.SID, x['event']['event_id'])
        x['fact'].update({'phase': 'issued', 'first_append_receipt_ref': ref})
        x['publication']['cas_expected'] = {'phase': 'issued', 'first_append_receipt_ref': ref}
    N('cas-fact-already-issued', edit(A, issued_fact), 'cas_fact_committed', plan=[pg(fam, 'source_phase_cas')])
    N('cas-stale-phase', post(A, '/publication/cas_expected/phase', 'issued'), 'cas_expected_phase', plan=[pg(fam, 'source_phase_cas')])
    N('cas-stale-receipt', post(A, '/publication/cas_expected/first_append_receipt_ref', 'sp286:first_receipt:stale'), 'cas_expected_receipt',
      plan=[pg(fam, 'source_phase_cas')])
    N('cas-after-phase', post(A, '/publication/fact_after/phase', 'source_committed'), 'cas_after_phase', plan=[pg(fam, 'source_phase_cas')])
    N('cas-after-receipt', post(A, '/publication/fact_after/first_append_receipt_ref', 'sp286:first_receipt:minted'), 'cas_after_receipt',
      plan=[pg(fam, 'source_phase_cas')])
    N('cas-after-body', post(A, '/publication/fact_after/owner_operation_id', 'op.rewritten'), 'cas_after_unchanged',
      plan=[pg(fam, 'source_phase_cas')])
    order = list(A['publication']['order'])

    def swapped(a, b):
        o = list(order)
        i, j = o.index(a), o.index(b)
        o[i], o[j] = o[j], o[i]
        return o
    N('order-append-before-source', post(A, '/publication/order', swapped('source_commit', 'append')), 'order_source_before_append')
    early = [x for x in order if x != 'expose']
    early.insert(early.index('receipt_resolved'), 'expose')
    N('order-expose-before-receipt', post(A, '/publication/order', early), 'order_receipt_before_expose')
    N('order-cas-before-receipt', post(A, '/publication/order', swapped('receipt_resolved', 'fact_cas')), 'order_receipt_before_cas')
    if s in W.STARTED:
        rest = [x for x in order if x != 'native_dispatch']
        N('order-dispatch-before-receipt', post(A, '/publication/order', rest[:2] + ['native_dispatch'] + rest[2:]),
          'order_append_before_dispatch')
        N('order-dispatch-before-source', post(A, '/publication/order', ['receipt_resolved', 'native_dispatch', 'source_commit', 'append',
                                                                         'fact_cas', 'expose']),
          'order_source_before_dispatch', plan=[pg(fam, 'transition/2')])
    if s in W.COMPLETED:
        N('order-append-before-outcome', post(A, '/publication/order', ['source_commit', 'append', 'native_outcome'] + order[3:]),
          'order_outcome_before_append')
        rest = [x for x in order if x != 'terminal_publication']
        rest.insert(rest.index('receipt_resolved'), 'terminal_publication')
        N('order-terminal-before-receipt', post(A, '/publication/order', rest), 'order_terminal_after_receipt')

    # transitions -------------------------------------------------------------------------------------------------------
    transition_negatives(C, fam, B, A, base, nb, N)

    # schema sites (plan entries and every inherited assertion the base reaches) ------------------------------------------
    plan_sites = plan_site_map(fam)
    schema_negatives(C, fam, base, A, '/event/payload', W.subject_uri(fam, 'payload'), 'payload_schema', 'payload_fullmatch', 'payload',
                     plan_sites)
    schema_negatives(C, fam, base, A, '/fact', W.subject_uri(fam, 'fact'), 'fact_schema', 'fact_fullmatch', 'fact', plan_sites)
    schema_negatives(C, fam, base, A, '/publication/custody/receipt', W.RECEIPT_URI, 'receipt_schema', 'receipt_schema', 'receipt', {})
    env_sites = schema_negatives_envelope(C, fam, base, A)
    special_plan_sites(C, fam, A, base, N)

    # retained originals -----------------------------------------------------------------------------------------------
    retained(C, fam, B, A)
    recovery_backup(C, fam, B, LE)
    checkpoints(C, fam)
    return env_sites


def _with_orig(x, B):
    x['_original'] = copy.deepcopy(B['_original'])
    return x


def schema_negatives_envelope(C, fam, base, A):
    """EventRecord owner assertions on the candidate (event_type is the scenario family row's own witness)."""
    sc = A
    inst = sc['event']
    sites, seen = [], set()
    walk_sites(W.ENVELOPE_URI + '#', inst, '', sites, seen)
    n = 0
    done = set()
    for s in sites:
        if s['iptr'].startswith('/event_type') or s['iptr'].startswith('/payload/') or (s['iptr'], s['kw'], s['site']) in done:
            continue
        done.add((s['iptr'], s['kw'], s['site']))
        target = '/event' + s['iptr']
        if s['kw'] == 'required':
            if s['arg'] == 'event_type':
                continue
            cands = [post(sc, target + '/' + esc(s['arg']), None, delete=True)]
        elif s['kw'] == 'additionalProperties':
            cands = [post(sc, target + '/x_unknown_member', 'x')]
        elif s['kw'] == 'format':
            for label, t in TIME_BREAKS:
                C.neg(base + '/neg/envelope/format/' + label + s['iptr'] + '@' + sitehash(s['site']), base, post(sc, target, t), 'envelope_schema',
                      plan=(k(fam) + '/timestamp_owner_profile',), defect='EventRecord date-time at ' + target)
            continue
        else:
            cands = [post(sc, target, m) for m in mutations_for(s, get_ptr(sc, target))]
        for cand in cands:
            if not valid_at(W.ENVELOPE_URI, cand['event']):
                if s['iptr'] == '' and s['kw'] == 'type':
                    break
                C.neg(base + '/neg/envelope/' + s['kw'] + s['iptr'] + ('/' + s['arg'] if s['kw'] == 'required' else '') + '@' + sitehash(s['site']), base, cand,
                      'envelope_schema', defect='EventRecord ' + s['kw'] + ' at ' + target)
                n += 1
                break
        else:
            if cands:
                C.implied.append({'family': fam, 'site': s['site'], 'instance': target, 'keyword': s['kw']})
    return n


def special_plan_sites(C, fam, A, base, N):
    """Plan schema entries that name a branch or a conditional rather than an assertion the valid base reaches."""
    kid = k(fam)
    plan = {g['schema_site']: g['guard'] for g in plan_entries(fam) if '/schema/' in g['guard']}
    d = '#/$defs/' + kid
    for site, guard in plan.items():
        tail = site[len(d):]
        if tail.endswith('/oneOf/1/type') and '/properties/' in tail:
            fld = tail.split('/properties/')[1].split('/')[0]
            subject = tail.split('/')[0]
            ptr, row_ = {'_fact': ('/fact/', 'fact_schema'), '_payload': ('/event/payload/', 'payload_schema')}.get(subject, (None, None))
            if ptr is None:
                continue
            N('schema-null-branch-' + subject.strip('_') + '-' + fld, post(A, ptr + fld, 5), row_, plan=[guard])
        elif tail == '_fact/oneOf/0/properties/source_body_ref/type':
            N('schema-branch-inline-ref-set', post(A, '/fact/source_body_ref', {'blake3_id': H('y'), 'byte_size': 10,
                                                                                 'media_type': L.SOURCE_MEDIA}), 'fact_schema', plan=[guard])
        elif tail == '_fact/oneOf/1/properties/source_body/type':
            N('schema-branch-ref-body-null', edit(A, lambda x: x['fact'].update({'source_body': None, 'source_body_ref': None})), 'fact_schema',
              plan=[guard])
        elif tail == '_fact/allOf/0/if/properties/phase/const':
            N('schema-if-issued', post(A, '/fact/phase', 'issued'), 'fact_schema', plan=[guard])
        elif tail == '_fact/allOf/1/if/properties/phase/const' or tail == '_fact/allOf/1/then/properties/first_append_receipt_ref/type':
            N('schema-if-committed-' + tail.split('/')[-2], post(A, '/fact/first_append_receipt_ref', 'sp286:first_receipt:x'), 'fact_schema',
              plan=[guard])
        elif tail.startswith('_fact/allOf/') and tail.endswith('/if/required/phase'):
            N('schema-if-required-phase-' + tail.split('/')[2], post(A, '/fact/phase', None, delete=True), 'fact_schema', plan=[guard])
        elif tail == '_payload/type':
            N('schema-payload-not-object-event', post(A, '/event/payload', []), 'envelope_schema', plan=[guard])
            N('schema-payload-not-object-fact', post(A, '/fact/source_body/payload', []), 'fact_schema', plan=[guard])
        elif tail == '_source_body/type':
            N('schema-source-body-not-object', post(A, '/fact/source_body', 5), 'fact_schema', plan=[guard])
        elif tail == '_fact/type':
            pass


COMMAND_SWAP = {
    'backend.detected': ('cmd.source_control.backend.select', {'scm_backend': 'git'}),
    'backend.selected': ('cmd.source_control.backend.detect', {'backend_candidates': ['git', 'jujutsu']}),
    'checkpoint.created': ('cmd.source_control.checkpoint.inspect', {'checkpoint_ref': 'ckptref:alpha:1'}),
    'checkpoint.restored': ('cmd.source_control.checkpoint.inspect', {}),
    'remote.fetch_completed': ('cmd.source_control.remote.publish', {}), 'remote.fetch_started': ('cmd.source_control.remote.publish', {}),
    'remote.publish_completed': ('cmd.source_control.remote.fetch', {}), 'remote.publish_started': ('cmd.source_control.remote.fetch', {}),
    'remote.sync_completed': ('cmd.source_control.remote.fetch', {}), 'remote.sync_started': ('cmd.source_control.remote.fetch', {}),
    'repository.bound': ('cmd.source_control.repository.unbind', {'writer_lease_ref': 'lease:writer:alpha:2', 'currentness_generation': 5}),
    'repository.unbound': ('cmd.source_control.workspace.switch', {}),
    'status.refreshed': ('cmd.source_control.diff.open', {}), 'workspace.created': ('cmd.source_control.workspace.list', {}),
    'workspace.opened': ('cmd.source_control.history.open', {}), 'workspace.removed': ('cmd.source_control.workspace.switch', {}),
    'workspace.switched': ('cmd.source_control.workspace.remove', {}),
}


def request_negatives(C, fam, B, A, base, nb, N):
    s = L.short(fam)
    cmd, extra = COMMAND_SWAP[s]

    def legacy(fn):
        def wrap(req):
            fn(req['legacy_request'])
            return req
        return wrap

    def swap(req):
        sc = scope_of(req)
        sc['command_id'] = cmd
        sc.update(copy.deepcopy(extra))
        return req
    N('request-command', nb(request_fn=swap), 'request_command', plan=[pg(fam, 'original_acceptance')])
    N('request-instance', nb(request_fn=legacy(lambda r: r.update({'command_instance_id': 'cmdi.other.1'}))), 'request_instance')
    N('request-idempotency', nb(request_fn=legacy(lambda r: r.update({'idempotency_key': 'reqkey.other.1'}))), 'request_idempotency')
    for fld in LINEAGE_REQ:
        N('request-lineage-' + fld, nb(request_fn=legacy(lambda r, f=fld: r['scope']['lineage'].update({f: r['scope']['lineage'][f] + '.other'}))),
          'request_lineage_' + fld)
    for fld in SCOPE_REQ:
        sc0 = scope_of(A['fact']['source_body']['original_request'])
        if fld not in sc0 or fld not in A['event']['payload']:
            continue
        if fld == 'scm_backend':
            def fn(r):
                r['scope']['scm_backend'] = 'jujutsu'
                r['scope']['expected_revision'] = L.jj_rev('head')
        else:
            def fn(r, f=fld):
                r['scope'][f] = r['scope'][f] + '.other'
        N('request-scope-' + fld, nb(request_fn=legacy(fn)), 'request_scope_' + fld)
    N('request-permission-ref', nb(request_fn=legacy(lambda r: r.update({'permission_snapshot_ref': 'perm:snap:other:1'}))),
      'request_permission_ref', plan=[pg(fam, 'before_effect_authority')])
    N('request-filesafe-ref', nb(request_fn=legacy(lambda r: r.update({'file_safe_decision_ref': 'filesafe:dec:other:1'}))),
      'request_filesafe_ref', plan=[pg(fam, 'before_effect_authority')])
    if 'writer_lease' in W.spec(fam)['authorities']:
        N('request-writer-lease-ref', nb(request_fn=legacy(lambda r: r['scope'].update({'writer_lease_ref': 'lease:writer:other:9'}))),
          'request_writer_lease_ref', plan=[pg(fam, 'before_effect_authority')])
    if 'credential' in W.spec(fam)['authorities']:
        N('request-credential-ref', nb(request_fn=legacy(lambda r: r['scope'].update({'credential_lease_ref': 'lease:cred:other:9'}))),
          'request_credential_ref', plan=[pg(fam, 'before_effect_authority')])
    if s.startswith('remote.sync'):
        lb = k(fam) + '/append/local'
        LB = C.base[lb]

        def lnb(**kn):
            return L.append_case(L.build(fam, variant='local', **kn))

        def tgt(f, v):
            def fn(req):
                req['target'][f] = v
                return req
            return fn
        N('request-target-project', lnb(request_fn=tgt('project_id', 'proj.other')), 'request_target_project', base_id=lb)
        N('request-target-backend', lnb(request_fn=tgt('backend', 'jujutsu')), 'request_target_backend', base_id=lb)
        N('request-target-operation', lnb(request_fn=tgt('operation_id', 'op.other.9')), 'request_target_operation', base_id=lb)
        N('request-target-instance', lnb(request_fn=tgt('command_instance_id', 'cmdi.other.9')), 'request_instance', base_id=lb)
        N('request-v2-idempotency', lnb(request_fn=lambda req: req.update({'idempotency_key': 'reqkey.other.9'}) or req),
          'request_idempotency', base_id=lb)

        def v2perm(req):
            req['target']['permission_evidence']['source_ref'] = 'perm:snap:other:9'
            return req
        N('request-v2-permission', lnb(request_fn=v2perm), 'request_permission_ref', base_id=lb)
        N('request-variant', lnb(payload_over={'sync_variant': 'remote_effect'}, native_over={'sync_variant': 'remote_effect'}),
          'request_variant', base_id=lb)
        for label, t in TIME_BREAKS:
            N('preview-expires-' + label, post(LB, '/fact/source_body/original_request/target/preview_expires_at', t), 'fact_schema',
              plan=[pg(fam, 'timestamp_owner_profile')], base_id=lb)
        N('v2-push-targets', post(LB, '/fact/source_body/original_request/target/push_targets', ['origin']), 'fact_schema',
          plan=[pg(fam, 'transition/3')], base_id=lb)
        N('v2-publish-performed', post(LB, '/fact/source_body/original_request/target/publish_performed', True), 'fact_schema',
          plan=[pg(fam, 'transition/3')], base_id=lb)


def wpost(A, ptr, value):
    return post(A, '/owner/world' + ptr, value)


def transition_negatives(C, fam, B, A, base, nb, N):
    s = L.short(fam)
    kid = k(fam)
    T = {}

    def add(rid, scenario, base_id=base):
        T[rid] = (scenario, base_id)

    def coherent(fields, world_fn=None, variant='base'):
        """Native owner value and its source copies change together (owner committed it); world kept unless world_fn."""
        sc = L.build(fam, variant=variant, payload_over=fields, native_over=fields)
        if world_fn:
            world_fn(sc['owner']['world'])
        return L.append_case(sc)
    if s == 'backend.detected':
        add('t_detect_set', wpost(A, '/setup_state/observed_backends', ['git']))
        add('t_detect_complete', coherent({'observation_state': 'partial'}))
        add('t_detect_partial', coherent({'observation_state': 'complete'}, variant='partial'), kid + '/append/partial')
        add('t_detect_unavailable', coherent({'observation_state': 'complete'}, variant='unavailable'), kid + '/append/unavailable')
        add('t_detect_host', wpost(A, '/setup_state/host_id', 'host.other'))
        add('t_detect_environment', wpost(A, '/setup_state/environment_id', 'env.other'))
        add('t_detect_topology', wpost(A, '/setup_state/topology_generation', 5))
    elif s == 'backend.selected':
        def req_backend(req):
            scope_of(req)['scm_backend'] = 'git'
            return req
        add('t_select_request', nb(request_fn=req_backend))
        add('t_select_effective', wpost(A, '/selection/effective_backend', 'git'))
        add('t_select_result', wpost(A, '/selection/result_backend', 'git'))
        add('t_select_previous', wpost(A, '/selection/saved_previous_backend', 'jujutsu'))
        add('t_select_committed', wpost(A, '/selection/kind', 'profile_preview'))
    elif s == 'checkpoint.created':
        def rq(f, v):
            def fn(req):
                scope_of(req)[f] = v
                return req
            return fn
        add('t_ckc_id_request', nb(request_fn=rq('checkpoint_id', 'ckpt.other')))
        add('t_ckc_id_saved', wpost(A, '/checkpoint/checkpoint_id', 'ckpt.other'))
        add('t_ckc_purpose', wpost(A, '/checkpoint/purpose', 'handoff'))
        add('t_ckc_generation_request', nb(request_fn=rq('expected_checkpoint_generation', 4)))
        add('t_ckc_generation_saved', wpost(A, '/checkpoint/generation', 4))
        add('t_ckc_revision', wpost(A, '/checkpoint/native_revision', L.git_rev('other')))
        jj = L.jj_rev('ckpt')
        add('t_ckc_backend_tag', coherent({'checkpoint_revision': jj}, world_fn=lambda w: w['checkpoint'].update({'native_revision': jj})))
        add('t_ckc_durable', wpost(A, '/checkpoint/durable', False))
    elif s == 'checkpoint.restored':
        def rq(f, v):
            def fn(req):
                scope_of(req)[f] = v
                return req
            return fn
        add('t_ckr_ref_request', nb(request_fn=rq('checkpoint_ref', 'ckptref:other')))
        add('t_ckr_selected_id', wpost(A, '/selected_checkpoint/checkpoint_id', 'ckpt.other'))
        add('t_ckr_selected_ref', wpost(A, '/selected_checkpoint/checkpoint_ref', 'ckptref:other'))
        add('t_ckr_generation_request', nb(request_fn=rq('expected_checkpoint_generation', 4)))
        add('t_ckr_generation_saved', wpost(A, '/selected_checkpoint/generation', 4))
        add('t_ckr_after_observed', wpost(A, '/observed_after_revision', L.git_rev('other')))
        add('t_ckr_success', wpost(A, '/receipt/outcome', 'unknown'))
        add('t_ckr_receipt_ref', wpost(A, '/receipt/receipt_ref', 'receipt:other'))
    elif s.startswith('remote.'):
        n = s.replace('.', '_')
        add('t_rt_resolves_' + n, wpost(A, '/captured_target/target_ref', 'rtarget:other'))
        add('t_rt_repo_' + n, wpost(A, '/captured_target/repo_id', 'repo.other'))
        add('t_rt_revision_' + n, wpost(A, '/captured_target/native_revision', L.git_rev('other')))
        add('t_rt_captured_' + n, wpost(A, '/captured_target/source', 'remote_display_text'))
        add('t_dispatch_target_' + n, wpost(A, '/dispatch/target_ref', 'rtarget:other'))
        add('t_dispatch_writer_' + n, wpost(A, '/dispatch/writer_lease_ref', 'lease:writer:other'))
        add('t_dispatch_credential_' + n, wpost(A, '/dispatch/credential_lease_ref', 'lease:cred:other'))
        if s.endswith('_completed'):
            add('t_done_success_' + n, wpost(A, '/receipt/outcome', 'unknown'))
            add('t_done_receipt_ref_' + n, wpost(A, '/receipt/receipt_ref', 'receipt:other'))
            add('t_done_after_receipt_' + n, wpost(A, '/receipt/after_revision', L.git_rev('other')))
            add('t_done_after_observed_' + n, wpost(A, '/observed_after_revision', L.git_rev('other')))
            add('t_done_no_unresolved_' + n, wpost(A, '/unresolved_effects', ['push:mirror']))
        if s == 'remote.publish_completed':
            add('t_fanout_all', wpost(A, '/fanout/succeeded', ['origin']))
        if s.startswith('remote.publish'):
            add('t_fanout_no_retry_' + n, wpost(A, '/fanout/auto_retry', True))
        if s.startswith('remote.sync'):
            lb = kid + '/append/local'
            LB = C.base[lb]
            add('t_sync_no_publish_' + n, wpost(LB, '/publish_performed', True), lb)
            add('t_sync_no_push_' + n, wpost(LB, '/push_targets', ['origin']), lb)
            add('t_sync_strategy_' + n, wpost(LB, '/resolved_strategy', 'merge'), lb)
            add('t_sync_original_revision_' + n, wpost(LB, '/original_revision', 'origrev:other'), lb)
            add('t_sync_fork_revision_' + n, wpost(LB, '/fork_revision', 'forkrev:other'), lb)
    elif s == 'repository.bound':
        for f in ('project_id', 'repo_id', 'workspace_id'):
            add('t_bind_' + f, wpost(A, '/binding/' + f, A['owner']['world']['binding'][f] + '.other'))
        add('t_bind_scm_backend', wpost(A, '/binding/scm_backend', 'jujutsu'))
        add('t_bind_ref', wpost(A, '/binding/binding_ref', 'binding:other'))
        add('t_bind_generation', wpost(A, '/binding/generation', 2))
        add('t_bind_forge', wpost(A, '/binding/forge_binding', {'forge_provider': 'gitlab', 'binding_ref': 'forgebind:other'}))
        add('t_bind_revision', wpost(A, '/verified_checkout_revision', L.git_rev('guess')))
        add('t_bind_no_conflict', wpost(A, '/existing_binding_ref', 'binding:other'))
    elif s == 'repository.unbound':
        for f in ('binding_ref', 'project_id', 'repo_id', 'workspace_id'):
            add('t_unbind_' + f, wpost(A, '/captured_binding/' + f, A['owner']['world']['captured_binding'][f] + '.other'))
        add('t_unbind_generation', wpost(A, '/captured_binding/generation', 2))
        add('t_unbind_settled', wpost(A, '/disposition/settled', False))
        add('t_unbind_disposition_ref', wpost(A, '/disposition/receipt_ref', 'disposition:other'))
        add('t_unbind_only_selected', wpost(A, '/removed_bindings', ['binding:alpha:1', 'binding:other']))
        add('t_unbind_no_native_deletion', wpost(A, '/inferred_native_deletion', True))
    elif s == 'status.refreshed':
        add('t_status_snapshot', wpost(A, '/status_result/snapshot_ref', 'status:other'))
        add('t_status_repo', wpost(A, '/status_result/repo_id', 'repo.other'))
        add('t_status_workspace', wpost(A, '/status_result/workspace_id', 'ws.other'))
        add('t_status_state', wpost(A, '/status_result/observation_state', 'stale'))
        add('t_status_revision', wpost(A, '/status_result/native_revision', L.git_rev('other')))
        for f in ('executed_hooks', 'executed_filters', 'jj_snapshot'):
            add('t_status_no_' + f, wpost(A, '/status_result/' + f, True))
    elif s == 'workspace.created':
        def rq(req):
            scope_of(req)['requested_workspace_id'] = 'ws.alpha.other'
            return req
        add('t_wc_requested', nb(request_fn=rq))
        add('t_wc_observed', wpost(A, '/observed_workspace_id', 'ws.alpha.other'))
        add('t_wc_plan_destination', wpost(A, '/conflict_plan/destination', 'ws.alpha.other'))
        add('t_wc_plan_admitted', wpost(A, '/conflict_plan/admitted', False))
        add('t_wc_success', wpost(A, '/receipt/outcome', 'unknown'))
        add('t_wc_receipt_ref', wpost(A, '/receipt/receipt_ref', 'receipt:other'))
    elif s == 'workspace.opened':
        add('t_wo_requested', coherent({'opened_workspace_id': 'ws.alpha.other'},
                                       world_fn=lambda w: w['open_result'].update({'workspace_id': 'ws.alpha.other'})))
        add('t_wo_result', wpost(A, '/open_result/workspace_id', 'ws.other'))
        add('t_wo_result_ref', wpost(A, '/open_result/result_ref', 'result:other'))
        add('t_wo_revision', wpost(A, '/read/native_revision', L.git_rev('other')))
        add('t_wo_backend', wpost(A, '/read/backend', 'jujutsu'))
        add('t_wo_current', wpost(A, '/read/current', False))
        add('t_wo_kind', wpost(A, '/open_result/operation_kind', 'switch'))
    elif s == 'workspace.removed':
        add('t_wr_requested', coherent({'removed_workspace_id': 'ws.alpha.other'},
                                       world_fn=lambda w: w['removal_result'].update({'workspace_id': 'ws.alpha.other'})))
        add('t_wr_result', wpost(A, '/removal_result/workspace_id', 'ws.other'))
        for f in ('ownership', 'dependency', 'active_work', 'data_disposition'):
            add('t_wr_' + f, wpost(A, '/checks/' + f, 'pending'))
        add('t_wr_native', wpost(A, '/removal_result/kind', 'unbind'))
        add('t_wr_no_expiry_cleanup', wpost(A, '/removal_result/cleanup_inferred_from_expiry', True))
        add('t_wr_receipt_ref', wpost(A, '/receipt/receipt_ref', 'receipt:other'))
        add('t_wr_disposition_ref', wpost(A, '/disposition_receipt_ref', 'disposition:other'))
    elif s == 'workspace.switched':
        add('t_ws_requested', coherent({'selected_workspace_id': 'ws.alpha.other'},
                                       world_fn=lambda w: w['switch_result'].update({'selected_workspace_id': 'ws.alpha.other'})))
        add('t_ws_observed', wpost(A, '/switch_result/selected_workspace_id', 'ws.other'))
        add('t_ws_previous', wpost(A, '/captured_selection/workspace_id', 'ws.other'))
        add('t_ws_previous_captured', wpost(A, '/captured_selection/source', 'ui_focus'))
        add('t_ws_dispatch', wpost(A, '/dispatch_log', ['cmd.source_control.workspace.select_worktree', 'cmd.source_control.workspace.switch']))
        add('t_ws_receipt_ref', wpost(A, '/receipt/receipt_ref', 'receipt:other'))
    elif s == 'writer_lease.granted':
        lease = A['owner']['world']['lease']
        for f in ('repo_id', 'workspace_id', 'holder_ref', 'lease_id', 'lease_ref'):
            add('t_lg_' + f, wpost(A, '/lease/' + f, lease[f] + '.other'))
        add('t_lg_scm_backend', wpost(A, '/lease/scm_backend', 'jujutsu'))
        add('t_lg_generation', wpost(A, '/lease/generation', lease['generation'] + 1))
        add('t_lg_epoch', wpost(A, '/lease/epoch', lease['epoch'] + 1))
        add('t_lg_no_competitor', wpost(A, '/competing_active_writers', ['holder:agent:9']))
        rb = kid + '/append/reconciled'
        add('t_lg_reconciled', wpost(C.base[rb], '/previous_reconciliation', 'conflicted'), rb)
        add('t_lg_owner_verified', wpost(A, '/lease/verified_by', 'payload'))
        add('t_lg_current', wpost(A, '/lease/current', False))
    elif s == 'writer_lease.lost':
        prior = A['owner']['world']['prior_lease']
        add('t_ll_holder_ref', wpost(A, '/prior_lease/holder_ref', prior['holder_ref'] + '.other'))
        add('t_ll_lease_id', wpost(A, '/prior_lease/lease_id', prior['lease_id'] + '.other'))
        add('t_ll_generation', wpost(A, '/prior_lease/generation', prior['generation'] + 1))
        add('t_ll_epoch', wpost(A, '/prior_lease/epoch', prior['epoch'] + 1))
        add('t_ll_prior_active', wpost(A, '/prior_lease/state', 'requested'))
        add('t_ll_after_state', wpost(A, '/lease_after/state', 'revoked'))
        add('t_ll_fenced', wpost(A, '/mutation_fenced', False))
        eb = kid + '/append/expired'
        add('t_ll_no_clean_on_expiry', coherent({'reconciliation_state': 'clean'}, variant='expired'), eb)
        add('t_ll_no_removal_proof', wpost(A, '/removal_proven_by_expiry', True))
    for rid, (scenario, bid) in T.items():
        fams, idx = W.TRANSITION_PLAN[rid]
        N('transition-' + rid, scenario, rid, plan=[pg(fam, 'transition/' + str(idx))], base_id=bid)
    missing = [rid for rid, (fams, _) in W.TRANSITION_PLAN.items() if fam in fams and rid not in T]
    if missing:
        raise ValueError('transition rows without a witness for ' + fam + ': ' + ', '.join(missing))


def corrupt(orig, event_fn=None, fact_fn=None, held_fn=None, recompute=True):
    """A Storage-held original with one corrupt component; held digests follow the record unless held_fn breaks them."""
    o = copy.deepcopy(orig)
    if event_fn:
        event_fn(o['event'])
        if recompute:
            o['custody']['full_value_sha256'] = L._safe(L.full_value_commitment, o['event'])
            o['custody']['producer_semantic_sha256'] = L._safe(L.producer_semantic_digest, o['event'])
    if fact_fn:
        fact_fn(o['fact'])
    if held_fn:
        held_fn(o['custody'])
    return o


def retained(C, fam, B, A):
    kid, s = k(fam), L.short(fam)
    orig = B['_original']
    C.seal(orig)
    rid, hid = kid + '/retry/base', kid + '/history/base'
    R = C.pos(rid, L.retry_case(B), plan=[pg(fam, 'semantic_retry_equal'), pg(fam, 'storage_metadata_exclusion')])
    Hs = C.pos(hid, L.history_case(B), plan=[pg(fam, 'historical_live_change'), pg(fam, 'read_permission')])
    B2 = L.build(fam, event_over={'replay_policy': 'projector_replay_only'})
    C.seal(B2['_original'])
    C.pos(kid + '/history/replay-only-original', L.history_case(B2), plan=[pg(fam, 'historical_replay_only')])

    def RN(label, scenario, row, plan=(), base_id=rid):
        C.neg(base_id + '/neg/' + label, base_id, scenario, row, plan=tuple(plan))

    def HN(label, scenario, row, plan=()):
        C.neg(hid + '/neg/' + label, hid, scenario, row, plan=tuple(plan))

    # retry ----------------------------------------------------------------------------------------------------
    RN('semantic-conflict', L.retry_case(L.build(fam, payload_over={'execution_environment_id': 'env.other'}), original=orig), 'retry_conflict',
       plan=[pg(fam, 'semantic_retry_equal')])
    RN('comparison-with-storage-metadata', post(R, '/retry/comparison_recipe', 'cv317.producer_semantic+storage_metadata'),
       'retry_comparison_recipe', plan=[pg(fam, 'storage_metadata_exclusion')])
    RN('returns-other-receipt', post(R, '/retry/returned_receipt/byte_offset', 9999), 'retry_returns_original')
    RN('effect-on-dedupe', post(R, '/retry/effects', ['native_dispatch']), 'retry_no_effect', plan=[pg(fam, 'replay_no_effect')])
    RN('replay-only-retry', post(R, '/event/replay_policy', 'projector_replay_only'), 'replay_only', plan=[pg(fam, 'normal_replay_only_refusal')])
    RN('retry-event-id', post(R, '/event/event_id', 'evt_scs_' + kid + '_substituted'), 'event_identity', plan=[pg(fam, 'event_id_recipe')])
    RN('retry-caller-recipe', post(R, '/retry/recipe_selector', 'w3b@0'), 'recipe_override', plan=[pg(fam, 'original_recipe_selection')])
    RN('retry-observed-offset', post(R, '/event/observed_at_utc', '2026-11-05T10:20:00.001+00:00'), 'storage_utc_z_observed_at_utc',
       plan=[pg(fam, 'timestamp_owner_profile')])
    BU = L.build(fam, op_over={'owner_operation_id': 'op.' + kid + '.unsealed'})
    RN('retry-unsealed-original', L.retry_case(BU), 'recipe_custody', plan=[pg(fam, 'first_receipt_missing')])
    RN('retry-frozen-full-value', edit(R, lambda x: x['storage']['custody'].update({'full_value_sha256': H('x')})), 'frozen_full_value',
       plan=[pg(fam, 'first_receipt_full_value')])

    # history: selection from the sealed receipt only ------------------------------------------------------------
    HN('caller-recipe', post(Hs, '/reader/recipe_selector', 'w3b@0'), 'recipe_override', plan=[pg(fam, 'original_recipe_selection')])
    HN('malformed-request', post(Hs, '/event/payload/owner_operation_id', None, delete=True), 'original_query')
    HN('missing-receipt', L.history_case(BU), 'recipe_custody', plan=[pg(fam, 'first_receipt_missing')])
    HN('other-original-receipt', post(Hs, '/storage/event/observed_at_utc', '2026-11-05T10:15:30.457Z'), 'recipe_receipt_binding',
       plan=[pg(fam, 'historical_live_change')])
    BA = L.build(fam, op_over={'owner_operation_id': 'op.' + kid + '.ambiguous'})
    C.seal(BA['_original'])
    C.seal(BA['_original'], duplicate=True)
    HN('ambiguous-receipts', L.history_case(BA), 'recipe_unique')
    BL = L.build(fam, op_over={'owner_operation_id': 'op.' + kid + '.legacy'})
    C.seal(BL['_original'], recipe='w3b@0')
    HN('unknown-edition', L.history_case(BL), 'recipe_installed', plan=[pg(fam, 'unknown_version')])
    BF = L.build(fam, op_over={'owner_operation_id': 'op.' + kid + '.foreign'})
    C.seal(BF['_original'], admission_family=OTHER_FAMILY[fam])
    HN('foreign-admission', L.history_case(BF), 'original_admission')
    HN('presented-other-key', post(Hs, '/event/idempotency_key', 'scs:' + kid + ':presented'), 'original_binding')
    HN('presented-application-scope', post(Hs, '/event/scope_kind', 'application'), 'original_scope',
       plan=[pg(fam, 'application_scope_refusal')])
    HN('unencodable-original', edit(Hs, lambda x: (x['storage']['event'].update({'sequence_id': 2 ** 64}),
                                                  x['event'].update({'sequence_id': 2 ** 64}))), 'dispatch_resolved',
       plan=[pg(fam, 'number_owner_rule')])

    # history: frozen verifier components over a sealed but corrupt original -----------------------------------------
    def frozen(label, o, row, plan=(), seal=True):
        if seal:
            C.seal(o)
        h = L.history_case(B, original=o)
        HN('frozen-' + label, h, row, plan)
    pslot = INT_SLOTS.get(s)
    frozen('fact-not-object', corrupt(orig, fact_fn=lambda f: f.clear()), 'frozen_fact_schema', seal=False)
    o = copy.deepcopy(orig)
    o['fact'] = 'not-an-object'
    frozen('fact-not-decodable-object', o, 'frozen_decodes', seal=False)
    frozen('envelope-schema', corrupt(orig, event_fn=lambda e: e.update({'redaction_profile': 'sometimes'})), 'frozen_envelope_schema')
    frozen('envelope-numbers', corrupt(orig, event_fn=lambda e: e.update({'producer_sequence_id': 7.0})), 'frozen_envelope_numbers',
           plan=[pg(fam, 'number_owner_rule')])
    for fld in ('observed_at_utc', 'persisted_at_utc'):
        frozen(fld + '-offset', corrupt(orig, event_fn=lambda e, f=fld: e.update({f: e[f][:-1] + '+00:00'})),
               'frozen_' + fld.split('_')[0] + '_utc', plan=[pg(fam, 'timestamp_owner_profile')])
    frozen('payload-schema', corrupt(orig, event_fn=lambda e: e['payload'].pop('source_location_id')), 'frozen_payload_schema')
    frozen('payload-trailing-lf', corrupt(orig, event_fn=lambda e: e['payload'].update({'source_location_id': e['payload']['source_location_id'] + '\n'})),
           'frozen_payload_fullmatch')
    if pslot:
        frozen('payload-integral-float', corrupt(orig, event_fn=lambda e: e['payload'].update({pslot: float(e['payload'][pslot])})),
               'frozen_payload_numbers', plan=[pg(fam, 'number_owner_rule')])

    def forged_id(o2):
        new = 'evt_scs_' + kid + '_forged'
        o2['event']['event_id'] = new
        o2['custody']['event_id'] = new
        o2['custody']['receipt']['event_id'] = new
        o2['fact']['event_id'] = new
        o2['fact']['first_append_receipt_ref'] = L.receipt_ref(L.SID, new)
        o2['custody']['full_value_sha256'] = L._safe(L.full_value_commitment, o2['event'])
        return o2
    frozen('event-identity', forged_id(copy.deepcopy(orig)), 'frozen_event_identity', plan=[pg(fam, 'historical_live_change')])
    frozen('key', corrupt(orig, event_fn=lambda e: e.update({'idempotency_key': 'scs:' + kid + ':forged'})), 'frozen_key')
    frozen('full-value', corrupt(orig, held_fn=lambda h: h.update({'full_value_sha256': H('x')})), 'frozen_full_value', seal=False)
    frozen('producer', corrupt(orig, held_fn=lambda h: h.update({'producer_semantic_sha256': H('x')})), 'frozen_producer', seal=False)
    frozen('custody-event', corrupt(orig, held_fn=lambda h: h.update({'event_id': 'evt.other'})), 'frozen_custody_event', seal=False)
    frozen('receipt-event', corrupt(orig, held_fn=lambda h: h['receipt'].update({'event_id': 'evt.other'})), 'frozen_receipt_event', seal=False)
    frozen('fact-phase', corrupt(orig, fact_fn=lambda f: f.update({'phase': 'sometimes'})), 'frozen_fact_schema', seal=False)
    frozen('fact-not-issued', corrupt(orig, fact_fn=lambda f: f.update({'phase': 'source_committed', 'first_append_receipt_ref': None})),
           'frozen_fact_issued', seal=False)
    frozen('fact-event', corrupt(orig, fact_fn=lambda f: f.update({'event_id': 'evt.other'})), 'frozen_fact_event', seal=False)
    frozen('fact-receipt', corrupt(orig, fact_fn=lambda f: f.update({'first_append_receipt_ref': 'sp286:first_receipt:other'})),
           'frozen_fact_receipt', seal=False)

    def fact_payload(f):
        f['source_body']['payload']['execution_environment_id'] = 'env.other'
    frozen('fact-payload', corrupt(orig, fact_fn=fact_payload), 'frozen_fact_payload', seal=False)

    # history: passive reader ------------------------------------------------------------------------------------------
    HN('permission-revoked', post(Hs, '/reader/permission', 'deny'), 'reader_permission', plan=[pg(fam, 'read_permission')])
    HN('project-deleted', post(Hs, '/reader/project_state', 'deleted'), 'reader_deleted', plan=[pg(fam, 'deletion_hold')])
    HN('project-hidden', post(Hs, '/reader/project_state', 'hidden'), 'reader_hidden', plan=[pg(fam, 'deletion_hold')])
    HN('purge-past-hold', edit(Hs, lambda x: x['reader'].update({'disposition': 'purge', 'holds': ['legal_hold:7']})), 'reader_hold',
       plan=[pg(fam, 'deletion_hold')])
    HN('reinterpreted-output', post(Hs, '/reader/output_hex', L.vbytes(dict(orig['event'], schema_version='3.0.0')).hex()), 'reader_output',
       plan=[pg(fam, 'unknown_version')])
    for kind in W.EFFECT_KINDS:
        HN('effect-' + kind, post(Hs, '/reader/effects', {kind: 1}), 'no_effect_' + kind,
           plan=[pg(fam, 'historical_replay_only'), pg(fam, 'replay_no_effect')])


def recovery_backup(C, fam, B, LE):
    kid = k(fam)
    ri, ru, rf = kid + '/recovery/issued', kid + '/recovery/unavailable', kid + '/recovery/fresh'
    Ri = C.pos(ri, L.recovery_case(B, 'issued'), plan=[pg(fam, 'source_phase_cas')])
    BU = L.build(fam, op_over={'owner_operation_id': 'op.' + kid + '.unsealed'})
    Ru = C.pos(ru, L.recovery_case(BU, 'unavailable'), plan=[pg(fam, 'first_receipt_missing')])
    Rf = C.pos(rf, L.recovery_case(B, 'fresh'), plan=[pg(fam, 'fresh_restore_operation')])

    def RN(bid, label, scenario, row, plan=()):
        C.neg(bid + '/neg/' + label, bid, scenario, row, plan=tuple(plan))

    def issued(x):
        ref = L.receipt_ref(L.SID, x['fact']['event_id'])
        x['fact'].update({'phase': 'issued', 'first_append_receipt_ref': ref})
    RN(ri, 'fact-already-issued', edit(Ri, issued), 'recovery_fact_committed', plan=[pg(fam, 'source_phase_cas')])
    BO = L.build(fam, op_over={'owner_operation_id': 'op.' + kid + '.0001'}, eid_over='evt_scs_' + kid + '_other_identity')
    RN(ri, 'other-identity', edit(Ri, lambda x: x.update({'event': copy.deepcopy(BO['event'])})), 'recovery_identity')
    RN(ri, 'cas-wrong-phase', post(Ri, '/recovery/proposed_phase', 'source_committed'), 'recovery_cas_phase', plan=[pg(fam, 'source_phase_cas')])
    RN(ri, 'cas-wrong-receipt', post(Ri, '/recovery/proposed_receipt_ref', 'sp286:first_receipt:minted'), 'recovery_cas_receipt',
       plan=[pg(fam, 'source_phase_cas')])
    RN(ri, 'older-restore-replacement-ack', post(Ri, '/recovery/replacement_ack', 'ack:replacement:1'), 'recovery_no_replacement_ack',
       plan=[pg(fam, 'older_restore_retry')])
    RN(ri, 'other-original-receipt', post(Ri, '/storage/event/observed_at_utc', '2026-11-05T10:15:30.457Z'), 'recipe_receipt_binding',
       plan=[pg(fam, 'first_receipt_missing')])
    RN(ru, 'restamp-unavailable', post(Ru, '/recovery/proposed_phase', 'issued'), 'recovery_fenced', plan=[pg(fam, 'first_receipt_missing')])
    RN(ru, 'mint-replacement-receipt', post(Ru, '/recovery/minted_receipt', {'event_id': BU['event']['event_id'], 'sequence_id': 1}),
       'recovery_no_mint', plan=[pg(fam, 'first_receipt_missing')])
    RN(rf, 'fresh-without-admission', post(Rf, '/recovery/fresh_operation_admission_ref', None), 'recovery_fresh_admitted',
       plan=[pg(fam, 'fresh_restore_operation')])
    RN(rf, 'restored-as-fresh', post(Rf, '/recovery/fresh_operation', B['fact']['owner_operation_id']), 'recovery_fresh_distinct',
       plan=[pg(fam, 'fresh_restore_operation')])
    # backup closure
    bb, bp = kid + '/backup/base', kid + '/backup/packs'
    Bk = C.pos(bb, L.backup_case(B), plan=[pg(fam, 'backup_closure')])
    LEB = L.build(fam, long_evidence=True)
    Bp = C.pos(bp, L.backup_case(LEB), plan=[pg(fam, 'backup_closure')])
    for fld, row in (('facts', 'closure_fact'), ('events', 'closure_event'), ('receipts', 'closure_receipt')):
        RN(bb, 'closure-without-' + fld, post(Bk, '/backup/closure/' + fld, []), row, plan=[pg(fam, 'backup_closure')])
    RN(bb, 'closure-without-native-ref', post(Bk, '/backup/closure/native_refs', Bk['backup']['closure']['native_refs'][1:]), 'closure_native',
       plan=[pg(fam, 'backup_closure')])
    RN(bp, 'closure-without-pack', post(Bp, '/backup/closure/packs', []), 'closure_packs', plan=[pg(fam, 'backup_closure')])


def checkpoints(C, fam):
    kid = k(fam)
    cb, cf, ce, cs = (kid + '/checkpoint/' + x for x in ('base', 'first', 'empty', 'successor'))
    K = C.pos(cb, L.checkpoint_case(fam), plan=[pg(fam, x) for x in ('checkpoint_storage_identity', 'checkpoint_global_coverage',
                                                                      'checkpoint_token', 'checkpoint_cas', 'checkpoint_current')],
              long_integer_base=True)
    C.pos(cf, L.checkpoint_case(fam, 'first'))
    C.pos(ce, L.checkpoint_case(fam, 'empty'), plan=[pg(fam, 'checkpoint_global_coverage')])
    C.pos(cs, L.checkpoint_case(fam, 'successor'), plan=[pg(fam, 'withdrawal_cutoff')])

    def KN(label, scenario, row, plan=(), base_id=cb):
        C.neg(base_id + '/neg/' + label, base_id, scenario, row, plan=tuple(plan))
    nxt = '/checkpoint/next'
    KN('no-next', post(K, nxt, None), 'ck_present')
    KN('next-not-object', post(K, nxt, []), 'ck_schema', plan=[pg(fam, 'schema/' + str(_plan_index(fam, '_checkpoint/type')))])
    KN('redb-snapshot-persisted', post(K, nxt + '/generic_token/redb_snapshot_id', 'redb:snap:9'), 'ck_schema', plan=[pg(fam, 'checkpoint_token')])
    KN('through-integral-float', post(K, nxt + '/through_sequence_id', 40.0), 'ck_numbers', plan=[pg(fam, 'number_owner_rule')])
    KN('stored-malformed', post(K, '/checkpoint/stored/consumer_id', None, delete=True), 'ck_stored_schema', plan=[pg(fam, 'checkpoint_rebuild')])
    KN('key-substituted', post(K, '/checkpoint/key', 'source_control_event.' + kid + '.checkpoint.v1:00'), 'ck_key',
       plan=[pg(fam, 'checkpoint_storage_identity')])
    KN('other-storage', post(K, nxt + '/storage_instance_id', L.OTHER_SID), 'ck_storage', plan=[pg(fam, 'checkpoint_storage_identity')])
    KN('other-project', post(K, nxt + '/project_id', L.OTHER_PROJECT), 'ck_project', plan=[pg(fam, 'checkpoint_storage_identity')])
    KN('token-other-storage', post(K, nxt + '/generic_token/storage_instance_id', L.OTHER_SID), 'ck_token_storage_instance_id',
       plan=[pg(fam, 'checkpoint_storage_identity'), pg(fam, 'checkpoint_token')])
    KN('token-other-key', post(K, nxt + '/generic_token/checkpoint_key', 'source_control_event.other.checkpoint.v1:00'),
       'ck_token_checkpoint_key', plan=[pg(fam, 'checkpoint_storage_identity'), pg(fam, 'checkpoint_token')])
    tok = K['checkpoint']['next']['generic_token']
    subs = {'checkpoint_ref': 'ckref:index:39', 'generation_id': 'eig_' + H('gen-other'), 'generation_anchor_sha256': H('anchor-other'),
            'frontier_revision': 41, 'frontier_sha256': H('frontier-other'), 'index_dataset_name': 'event_index.v0',
            'source_selection': dict(tok['source_selection'], manifest_generation=2)}
    for fld, val in subs.items():
        KN('token-' + fld, post(K, nxt + '/generic_token/' + fld, val), 'ck_token_' + fld, plan=[pg(fam, 'checkpoint_token')])

    def sel_sid(x):
        x['checkpoint']['next']['generic_token']['source_selection']['storage_instance_id'] = L.OTHER_SID
        x['checkpoint']['publication']['source_selection']['storage_instance_id'] = L.OTHER_SID
    KN('selection-other-storage', edit(K, sel_sid), 'ck_selection_storage', plan=[pg(fam, 'checkpoint_storage_identity')])
    rows = K['checkpoint']['publication']['rows']
    matching = [r['sequence_id'] for r in rows if not r.get('gap') and r['event_type'] == fam and r['project_id'] == L.PROJECT]
    KN('through-max-matching', post(K, nxt + '/through_sequence_id', matching[-1]), 'ck_through', plan=[pg(fam, 'checkpoint_global_coverage')])
    nonmatch = [r['sequence_id'] for r in rows if not r.get('gap') and r['event_type'] != fam][0]
    gap = [r['sequence_id'] for r in rows if r.get('gap')][0]
    KN('skip-nonmatching-row', post(K, '/checkpoint/scanned', [x for x in K['checkpoint']['scanned'] if x != nonmatch]), 'ck_coverage',
       plan=[pg(fam, 'checkpoint_global_coverage')])
    KN('skip-legal-gap', post(K, '/checkpoint/scanned', [x for x in K['checkpoint']['scanned'] if x != gap]), 'ck_coverage',
       plan=[pg(fam, 'checkpoint_global_coverage')])
    prev = [r for r in rows if not r.get('gap') and r['event_type'] == fam and r['project_id'] == L.PROJECT][-2]
    KN('last-event-earlier', post(K, nxt + '/last_event_id', prev['event_id']), 'ck_last_event', plan=[pg(fam, 'checkpoint_global_coverage')])
    KN('last-fact-earlier', post(K, nxt + '/last_source_fact_ref', prev['source_fact_ref']), 'ck_last_fact',
       plan=[pg(fam, 'checkpoint_global_coverage')])
    KN('cas-token', post(K, '/checkpoint/cas/token/frontier_revision', 19), 'ck_cas_token', plan=[pg(fam, 'checkpoint_cas')])
    KN('cas-through', post(K, '/checkpoint/cas/through_sequence_id', 19), 'ck_cas_through_sequence_id', plan=[pg(fam, 'checkpoint_cas')])
    KN('cas-last-event', post(K, '/checkpoint/cas/last_event_id', 'evt_scs_other'), 'ck_cas_last_event_id', plan=[pg(fam, 'checkpoint_cas')])
    KN('cas-last-fact', post(K, '/checkpoint/cas/last_source_fact_ref', 'source_control_event.other'), 'ck_cas_last_source_fact_ref',
       plan=[pg(fam, 'checkpoint_cas')])

    def backward(x):
        x['checkpoint']['stored']['through_sequence_id'] = 50
        x['checkpoint']['cas']['through_sequence_id'] = 50
    KN('cursor-backward', edit(K, backward), 'ck_monotonic', plan=[pg(fam, 'checkpoint_cas')])
    KN('current-moved', post(K, '/checkpoint/live_current/current_bytes_sha256', H('current-v3')), 'ck_current_bytes',
       plan=[pg(fam, 'checkpoint_current')])
    KN('frontier-moved', post(K, '/checkpoint/live_current/frontier_revision', 41), 'ck_current_frontier', plan=[pg(fam, 'checkpoint_current')])
    KN('cursor-only-publication', post(K, '/checkpoint/single_transaction', False), 'ck_atomic', plan=[pg(fam, 'checkpoint_cas')])
    KN('read-authority-not-revalidated', post(K, '/checkpoint/read_authority', False), 'ck_read_authority', plan=[pg(fam, 'read_permission')])
    KN('derived-source', post(K, '/checkpoint/rebuild_source', 'derived_checkpoint'), 'ck_rebuild_source', plan=[pg(fam, 'checkpoint_rebuild')])
    S = C.base[cs]
    KN('unverified-successor', post(S, '/checkpoint/successor/verified', False), 'ck_successor', plan=[pg(fam, 'withdrawal_cutoff')], base_id=cs)
    for kind in W.EFFECT_KINDS:
        KN('rebuild-effect-' + kind, post(K, '/checkpoint/effects', {kind: 1}), 'no_effect_' + kind, plan=[pg(fam, 'replay_no_effect')])
    for fld in ('last_event_id', 'last_source_fact_ref'):
        idx = _plan_index(fam, '_checkpoint/properties/' + fld + '/oneOf/1/type')
        KN('null-branch-' + fld, post(K, nxt + '/' + fld, 5), 'ck_schema', plan=[pg(fam, 'schema/' + str(idx))] if idx is not None else ())
    schema_negatives(C, fam, cb, K, nxt, W.subject_uri(fam, 'checkpoint'), 'ck_schema', 'ck_fullmatch', 'checkpoint', plan_site_map(fam))


def _plan_index(fam, tail):
    site = '#/$defs/' + k(fam) + tail
    for g in plan_entries(fam):
        if g.get('schema_site') == site:
            return int(g['guard'].rsplit('/', 1)[1])
    return None


def catalog():
    C = Catalog()
    for fam in W.FAMILIES:
        family(C, fam)
    return C.positives, C.negatives, C.seals


# ---------------------------------------------------------------------------------------------
# plan coverage
# ---------------------------------------------------------------------------------------------
IMPLIED_PLAN = {}


def coverage(fixtures):
    plan = json.loads(PLAN_FILE.read_text())
    witnesses = {}
    for c in fixtures['positives'] + fixtures['negatives']:
        for p in c.get('plan', []):
            witnesses.setdefault(p, []).append({'case': c['id'], 'row': (c['expect'] or {}).get('row') if c['expect'] != 'accept' else None})
    out, missing, implied = [], [], []
    for fam in plan['families']:
        kid = k(fam['event_type'])
        for g in fam['guards']:
            gid = g['guard']
            w = witnesses.get(gid, [])
            entry = {'guard': gid, 'witnesses': w[:12], 'witness_count': len(w)}
            if g.get('classification'):
                entry['classification'] = g['classification']
                entry['classification_evidence'] = g.get('classification_evidence')
                implied.append(gid)
            elif gid in IMPLIED_PLAN:
                entry['classification'] = 'implied_unreachable_alone'
                entry['classification_evidence'] = IMPLIED_PLAN[gid]
                implied.append(gid)
            elif not w:
                missing.append(gid)
            out.append(entry)
    return {'schema_id': 'pm.w3b.phase2_plan_coverage.v1', 'plan_entries': len(out), 'witnessed': len(out) - len(missing) - len(implied),
            'implied': implied, 'unwitnessed': missing, 'entries': out}
