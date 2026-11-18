#!/usr/bin/env python3
"""C12-DG5 schema clause closure over every DG owner root the five families' complete calls validate.

The closure algorithm, classes, defects, cut rule and kill test are GO's
(scripts/pm_goal_go_schema_closure.py, imported read-only; lane GC's standard). DG5 adds only how
the roots and their exact validators are obtained from the DG checkers:

* Collection: the family's DG5 source runs once under the DG5 bridge (discovery, no judge). In the
  parent's own run of each captured entry, every validator a bank builds is captured at its outermost
  ``iter_errors`` together with the instance and the complete error list. Child (sealed replay) runs
  record nothing.
* Closure validator: an annotated copy of the captured validator. Its class is the captured class
  extended with that class's OWN keyword functions, each wrapped by
  ``pm_goal_oracle_common._keyword_guard`` (attaches the clause id; honours the per-keyword cut). An
  evolve at a ``$schema`` boundary selects exactly the class the original would select, wrapped the
  same way. Copies of every registry resource get ``x-pm-oracle-id`` location annotations only;
  ``$schema``, ``$id``, anchors, enum/const/default data and every other byte are kept. Formats use
  the captured validator's own format checker.
* Agreement (no new rules): before a root is closed, the copy must reproduce the original's complete
  error list (instance path, keyword, schema path) on every recorded instance, accepted or refused.
  A disagreement makes the root UNCOVERED_ROOT_ERROR; nothing is closed on it.

Never shards one root across processes (TOOL-ISSUES T228); ``--roots``/``--shard`` select whole roots.

Usage: python3 scripts/pm_goal_dg5_closure.py --source pm_goal_dg5_ca --family goal.cancelled --out FILE
"""
import argparse
import collections
import copy
import hashlib
import inspect
import json
import os
import pickle
import sys
import time
from pathlib import Path

import attrs
import jsonschema
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_goal_oracle_common as common  # noqa: E402
import pm_goal_go_schema_closure as go  # noqa: E402

TOOL_SHA256 = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
SEED_CAP = 24
RECORD_CAP = 400          # recorded instances per root for the agreement check (accepted and refused)
RECORD_BYTES_CAP = 4 * 1024 * 1024  # pickled-record bytes per root; live deepcopies of custody-sized
                                    # instances OOMed collection at 2G on the 22k-call CA3 source
CAPTURE = [None]          # list receiving the outermost validator of one bank call
SLOTS = {}                # root key -> slot
PATCHED_CLASSES = set()
GUARDED = set()
_GUARD_MEMO = {}


# ---------------------------------------------------------------- capture

def _is_validator_class(value):
    return inspect.isclass(value) and hasattr(value, 'VALIDATORS') and hasattr(value, 'iter_errors') \
        and hasattr(value, 'META_SCHEMA')


def _patch_class(cls):
    if cls in PATCHED_CLASSES or cls in GUARDED:
        return
    original = cls.iter_errors

    def iter_errors(self, instance, _schema=None):
        sink = CAPTURE[0]
        if sink is not None and not sink:
            sink.append(self)
        if _schema is None:
            yield from original(self, instance)
        else:
            yield from original(self, instance, _schema)
    iter_errors._dg5_capture = True
    cls.iter_errors = iter_errors
    PATCHED_CLASSES.add(cls)


_SCANNED = [(-1, -1)]


def _validator_subclasses():
    seen, stack = set(), [v for v in vars(jsonschema.validators).values() if _is_validator_class(v)]
    while stack:
        cls = stack.pop()
        if cls in seen:
            continue
        seen.add(cls)
        stack.extend(cls.__subclasses__())
    return seen


def patch_validator_classes(force=False):
    """Every validator class reachable as a module attribute of a Goal checker module,
    jsonschema's own, and every subclass of those (factory-created classes such as
    FMT2's _original_validator(Validator) are module attributes nowhere; the old
    module-count scan gate also never re-ran after they were created, so their
    iter_errors was never patched and capture silently missed whole banks).
    extend()/create() classes do not inherit from their base, so a gc sweep
    (force, after a capture miss) is the last resort that finds them."""
    subclasses = _validator_subclasses()
    gate = (len(sys.modules), len(subclasses))
    if gate == _SCANNED[0] and not force:
        return
    _SCANNED[0] = gate
    for value in subclasses:
        _patch_class(value)
    for module in tuple(sys.modules.values()):
        name = getattr(module, '__name__', '')
        if not name.startswith(('pm_goal', 'pm_event')) or name.startswith(('pm_goal_phase_', 'pm_goal_table_')):
            continue
        for value in list(vars(module).values()):
            if _is_validator_class(value):
                _patch_class(value)
    if force:
        import gc
        for value in gc.get_objects():
            if type(value) is type and _is_validator_class(value):
                _patch_class(value)


def _hook_validator_factory(cls):
    """Capture at the bank's validator() factory too: a factory-created class is
    patched (and the instance captured) on its very first validation."""
    factory = getattr(cls, 'validator', None)
    if factory is None or getattr(factory, '_dg5_closure', False):
        return

    def validator(self, *args, **kwargs):
        result = factory(self, *args, **kwargs)
        _patch_class(type(result))
        sink = CAPTURE[0]
        if sink is not None and not sink:
            sink.append(result)
        return result
    validator._dg5_closure = True
    cls.validator = validator


def _signature(errors):
    return sorted((tuple(map(str, e.absolute_path)), str(e.validator), tuple(map(str, e.absolute_schema_path)))
                  for e in errors)


def _registry_digest(v, memo={}):  # noqa: B006 - per-process memo by registry identity
    resolver = v._resolver
    registry = getattr(resolver, '_registry', None)
    key = id(registry)
    if key not in memo:
        if registry is None:
            memo[key] = (None, 'no-registry:' + type(resolver).__qualname__)
        else:
            items = sorted((uri, hashlib.sha256(pickle.dumps(registry[uri].contents, protocol=5)).hexdigest())
                           for uri in registry)
            memo[key] = (registry, hashlib.sha256(json.dumps(items).encode()).hexdigest())
    return memo[key][1]


def hook_bank(cls, method='errors', family=None):
    """Observation only: the bank's own result is returned unchanged."""
    _hook_validator_factory(cls)
    original = getattr(cls, method)
    if getattr(original, '_dg5_closure', False):
        return

    def errors(self, *args):
        import pm_goal_dg5_boundaries as bridge
        # Only the parent's own run of a captured complete call records: child
        # replays (ACTIVE) and fixture construction outside an entry do not.
        if bridge.ACTIVE[0] or not bridge.PARENT_CALL[0]:
            return original(self, *args)
        patch_validator_classes()
        sink = []
        saved = CAPTURE[0]
        CAPTURE[0] = sink
        try:
            result = original(self, *args)
        finally:
            CAPTURE[0] = saved
        if not sink:
            patch_validator_classes(force=True)  # a factory class created mid-call: patch it for the next call
        if sink:
            v = sink[0]
            value = args[-1]
            try:
                key = (type(v).__module__ + '.' + type(v).__qualname__, json.dumps(v.schema, sort_keys=True),
                       _registry_digest(v), type(self).__qualname__)
            except Exception as exc:  # noqa: BLE001 - recorded, never silently skipped
                key = ('uncapturable', type(self).__qualname__, repr(args[:-1])[:200], type(exc).__name__)
            slot = SLOTS.setdefault(key, dict(validator=v, bank_object=self,
                                              bank=type(self).__module__ + '.' + type(self).__qualname__,
                                              args=[repr(a)[:200] for a in args[:-1]], seeds={}, records=[],
                                              families=set(), calls=0, refused=0))
            slot['calls'] += 1
            slot['families'].add(family or bridge_family())
            slot.setdefault('rows', set()).add(bridge.SCHEMA_ROW[0] or '<direct errors() call>')
            refused = bool(result)
            slot['refused'] += refused
            try:
                raw = pickle.dumps(value, protocol=5)
                sha = hashlib.sha256(raw).hexdigest()
            except Exception:  # noqa: BLE001 - an unpicklable instance is never a seed or record
                return result
            if not refused and len(slot['seeds']) < SEED_CAP:
                slot['seeds'].setdefault(sha, copy.deepcopy(value))
            if len(slot['records']) < RECORD_CAP and slot.get('record_bytes', 0) + len(raw) <= RECORD_BYTES_CAP \
                    and all(r[0] != sha for r in slot['records']):
                slot['records'].append((sha, raw, _signature(result)))
                slot['record_bytes'] = slot.get('record_bytes', 0) + len(raw)
        return result
    errors._dg5_closure = True
    setattr(cls, method, errors)


def default_banks():
    """The whole-root schema banks the DG Goal checkers validate through."""
    import pm_goal_test_owner_adapters as adapters
    import pm_goal_own_c_roots as own_c
    import pm_goal_own_c3_w12_bank as w12
    return [(adapters.RootBank, 'errors'), (own_c.OriginalBank, 'errors'), (w12.ScopedBankV2, 'errors')]


def bridge_family():
    import pm_goal_dg5_boundaries as bridge
    case = bridge.CASE[0] or {}
    return case.get('family') or FAMILY[0]


FAMILY = [None]


# ---------------------------------------------------------------- annotated, guarded copy

SCHEMA_MAPS = ('properties', 'patternProperties', '$defs', 'definitions', 'dependentSchemas')
SCHEMA_ONE = ('additionalProperties', 'unevaluatedProperties', 'contains', 'propertyNames', 'not', 'if', 'then',
              'else', 'unevaluatedItems', 'additionalItems', 'contentSchema')
SCHEMA_LISTS = ('allOf', 'anyOf', 'oneOf', 'prefixItems')


def _escape(part):
    return str(part).replace('~', '~0').replace('/', '~1')


def annotate(node, where, memo):
    """Location annotation only; every other member is the original object."""
    if not isinstance(node, dict):
        return node
    if id(node) in memo:
        return memo[id(node)]
    if 'x-pm-oracle-id' in node:
        raise ValueError('owner schema already carries x-pm-oracle-id at ' + where)
    out = dict(node)
    memo[id(node)] = out
    out['x-pm-oracle-id'] = where
    for key in SCHEMA_MAPS:
        if isinstance(node.get(key), dict):
            out[key] = {name: annotate(sub, where + '/' + key + '/' + _escape(name), memo)
                        for name, sub in node[key].items()}
    for key in SCHEMA_ONE:
        if isinstance(node.get(key), dict):
            out[key] = annotate(node[key], where + '/' + key, memo)
    if isinstance(node.get('items'), dict):
        out['items'] = annotate(node['items'], where + '/items', memo)
    elif isinstance(node.get('items'), list):
        out['items'] = [annotate(sub, where + '/items/' + str(i), memo) for i, sub in enumerate(node['items'])]
    for key in SCHEMA_LISTS:
        if isinstance(node.get(key), list):
            out[key] = [annotate(sub, where + '/' + key + '/' + str(i), memo) for i, sub in enumerate(node[key])]
    if isinstance(node.get('dependencies'), dict):
        out['dependencies'] = {name: annotate(sub, where + '/dependencies/' + _escape(name), memo)
                               if isinstance(sub, dict) else sub for name, sub in node['dependencies'].items()}
    return out


def _guard_key(cls):
    evolve = cls.__dict__.get('evolve') or cls.evolve
    cells = tuple(id(c.cell_contents) for c in (getattr(evolve, '__closure__', None) or ()))
    return (tuple(sorted((k, id(f)) for k, f in cls.VALIDATORS.items())), id(cls.META_SCHEMA), id(cls.TYPE_CHECKER),
            id(cls.FORMAT_CHECKER), getattr(evolve, '__code__', None), cells)


def guarded_class(cls):
    if cls in GUARDED:
        return cls
    key = _guard_key(cls)
    if key in _GUARD_MEMO:
        return _GUARD_MEMO[key]
    g = jsonschema.validators.extend(cls, {k: common._keyword_guard(k, f) for k, f in cls.VALIDATORS.items()})
    original_evolve = cls.evolve

    def evolve(self, **changes):
        proto = original_evolve(self, **changes)
        if type(proto) in GUARDED:
            return proto
        target = guarded_class(type(proto))
        return target(**{f.alias: getattr(proto, f.name) for f in attrs.fields(type(proto)) if f.init})
    g.evolve = evolve
    GUARDED.add(g)
    _GUARD_MEMO[key] = g
    return g


def _plain_registry(registry):
    """The owner resources of a resolver's registry, without the bundled meta-schemas."""
    from jsonschema_specifications import REGISTRY as SPECIFICATIONS  # the registry jsonschema combines in
    meta = set(SPECIFICATIONS)
    return [uri for uri in registry if uri not in meta]


def annotate_resources(registry, memo, uris=None):
    uris = _plain_registry(registry) if uris is None else uris
    ordered = sorted(uris, key=lambda uri: (-len(pickle.dumps(registry[uri].contents, protocol=5)), uri))
    pairs = []
    for uri in ordered:
        resource = registry[uri]
        pairs.append((uri, Resource(contents=annotate(resource.contents, uri + '#', memo),
                                    specification=resource._specification)))
    return Registry().with_resources(pairs).crawl()


def prepare_scoped_v2(bank, memo):
    """W12 ScopedBankV2: annotate its own and its retained bank's registries; node origins follow the copies."""
    bank.registry = annotate_resources(bank.registry, memo)
    retained = getattr(bank, 'retained', None)
    if retained is not None and hasattr(retained, 'registry'):
        retained.registry = annotate_resources(retained.registry, memo)
    origins = getattr(bank, 'node_origins', None)
    if origins is not None:
        for old, new in list(memo.items()):
            if old in origins:
                origins[id(new)] = origins[old]
    return bank


PREPARED = {}


def closure_validator(v, label, bank=None):
    """The annotated, guarded copy of captured validator `v` (see module docstring).

    Banks whose resolution reads bank state (W12 scoped imports, R's routed realm) are prepared once,
    after collection: their registries are replaced by annotated copies and their node-identity maps
    follow the copies. Collection has finished, so no recorded result depends on the prepared bank.
    """
    memo = PREPARED.setdefault('memo', {})
    resolver = v._resolver
    kind = type(resolver).__name__
    if kind == 'ScopedResolverV2':
        owner = resolver.bank
        if id(owner) not in PREPARED:
            PREPARED[id(owner)] = prepare_scoped_v2(owner, memo)
        inner = owner.registry.resolver(base_uri=resolver.resolver._base_uri)
        scoped = type(resolver)(inner, owner, resolver.origin, resolver.retained)
        schema = memo.get(id(v.schema)) or annotate(v.schema, 'dg5-root:' + label, memo)
        cls = guarded_class(type(v))
        return cls(schema=schema, registry=owner.registry, format_checker=v.format_checker, _resolver=scoped)
    if type(resolver).__module__ != 'referencing._core':
        raise TypeError('custom resolver ' + type(resolver).__qualname__ + ' needs an explicit copy rule')
    routed = getattr(bank, 'target_registry', None) if bank is not None else None
    if routed is not None and id(bank) not in PREPARED:
        bank.target_registry = annotate_resources(routed, memo)
        PREPARED[id(bank)] = bank
    registry = resolver._registry
    annotated = annotate_resources(registry, memo)
    cls = guarded_class(type(v))
    if resolver._base_uri == '' and id(v.schema) not in memo:
        schema = annotate(v.schema, 'dg5-root:' + label, memo)
        return cls(schema=schema, registry=annotated, format_checker=v.format_checker)
    schema = memo.get(id(v.schema)) or annotate(v.schema, 'dg5-root:' + label, memo)
    return cls(schema=schema, registry=annotated, format_checker=v.format_checker,
               _resolver=annotated.resolver(base_uri=resolver._base_uri))


def agree(original, copy_v, records):
    bad = []
    for sha, raw, expected in records:
        value = pickle.loads(raw)
        got = _signature(copy_v.iter_errors(value))
        if got != expected:
            bad.append(dict(input_sha256=sha, original=expected[:6], copy=got[:6]))
    return bad


# ---------------------------------------------------------------- GO2 port: memo, witness verify, dump
# The memoizing validator, error-signature relation and dump shape are GO2's
# (scripts/pm_goal_go2_closure.py, imported read-only): a subclass of the exact
# guarded-copy class reuses only fully-drained no-error results keyed by
# (schema node, exact-interned instance, base URI, schema context incl. cut);
# every refusal stream is recomputed. No search credit is taken from the memo
# copy before its agreement trial passes (records + seeds, with and without a
# cut), and in-run sampled agreement keeps comparing during the search.

def _memoised(instance):
    """GO2's Memo subclass of the guarded copy's class, or (instance, reason) when not applicable."""
    resolver = instance._resolver
    if type(resolver).__module__ != 'referencing._core':
        return instance, 'skipped-custom-resolver:' + type(resolver).__qualname__
    import pm_goal_go2_closure as go2
    cls = go2.memo_class(type(instance))
    # jsonschema's create() __init_subclass__ rebinds the stock evolve on the Memo
    # subclass, shadowing the guarded copy's custom evolve: evolved sub-validators
    # for referenced resources then come back unguarded (stock dialect class), so
    # inner errors lose their oracle_guard and the $ref guard replaces it (found by
    # the agree gate on dg5:c25e0ff944e76a07; in-run sampling flagged 27/64 on
    # dg5:9c17854a57867b18). Rebind the guarded evolve; GO2's classes need no such
    # fix because their guards do not ride a custom evolve.
    cls.evolve = type(instance).evolve
    return cls(**{f.alias: getattr(instance, f.name) for f in attrs.fields(type(instance)) if f.init}), 'memo'


def memo_agree(reference_v, memo_v, records, seeds):
    """GO2 agreement: identical error signatures (path, schema path, keyword, oracle
    guard, recursively) on recorded + seed instances, with and without one clause cut."""
    import pm_goal_go2_closure as go2
    values = [(sha, pickle.loads(raw)) for sha, raw, _expected in records]
    values += [(hashlib.sha256(pickle.dumps(s, protocol=5)).hexdigest(), s) for s in seeds]
    nodes = go.walk(reference_v)
    first_ident = None
    for info in nodes.values():
        for keyword in go.clauses_of(info['node']):
            first_ident = common.schema_guard(info['node'], keyword)
            break
        if first_ident:
            break
    bad = []
    for sha, value in values:
        for cut in (frozenset(), frozenset({first_ident}) if first_ident else frozenset()):
            if go2.signature(memo_v, value, cut) != go2.signature(reference_v, value, cut):
                bad.append(dict(input_sha256=sha, cut=sorted(cut)))
                break
    return bad


_WIT = dict(current=None, store={}, pending={}, bytes=0, sampled=dict(calls=0, compared=0, mismatch=0))
_WITNESS_BYTES_CAP = 64 * 1024 * 1024


def _install_search_wrappers(reference_v, search_v, sample_every):
    """Capture one exact witness value per clause (for post-close re-judging on the
    reference copy) and, when searching with the memo copy, sampled agreement.

    A witness is confirmed only when the same value (by pickle hash) is seen both
    uncut with the clause guard among its errors and cut with that guard gone —
    the exact pair the kill test itself judged. A kill-shaped pair (cut run has
    no errors at all) outranks a covered-shaped pair stored earlier in the same
    clause search: first-confirmed capture still failed re-judging on
    dg5:c25e0ff944e76a07, whose pattern edit also broke maxLength, so the
    covered-shaped pair was stored before the clean kill was found.
    """
    import pm_goal_go2_closure as go2
    orig_search, orig_errors = go.search_clause, go.errors_of
    _WIT.update(current=None, store={}, pending={}, locked=set(), bytes=0,
                sampled=dict(calls=0, compared=0, mismatch=0))

    def search(clause, keyword, location, info, node, ident, *args, **kwargs):
        _WIT['current'] = (clause, ident)
        _WIT['pending'] = {}
        try:
            return orig_search(clause, keyword, location, info, node, ident, *args, **kwargs)
        finally:
            _WIT['current'] = None
            _WIT['pending'] = {}

    def errors_of(v, value, cut=frozenset()):
        errs = orig_errors(v, value, cut)
        if search_v is not reference_v and v is search_v and sample_every:
            _WIT['sampled']['calls'] += 1
            if _WIT['sampled']['calls'] % sample_every == 0:
                _WIT['sampled']['compared'] += 1
                a = tuple(go2.error_signature(e) for e in errs)
                if a != go2.signature(reference_v, value, cut):
                    _WIT['sampled']['mismatch'] += 1
        cur = _WIT['current']
        if cur:
            clause, ident = cur
            if clause not in _WIT['locked']:
                try:
                    raw = pickle.dumps(value, protocol=5)
                except Exception:  # noqa: BLE001 - an unpicklable witness is reported unverifiable
                    raw = None
                if raw is not None:
                    digest = hashlib.sha256(raw).hexdigest()
                    guards = {getattr(e, 'oracle_guard', None) for e in errs}
                    if not cut and ident in guards:
                        _WIT['pending'][digest] = raw
                        while len(_WIT['pending']) > 64:
                            _WIT['pending'].pop(next(iter(_WIT['pending'])))
                    elif cut and ident not in guards and digest in _WIT['pending']:
                        confirmed = _WIT['pending'][digest]
                        previous = _WIT['store'].get(clause)
                        if _WIT['bytes'] + len(confirmed) - (len(previous) if previous else 0) <= _WITNESS_BYTES_CAP:
                            _WIT['store'][clause] = confirmed
                            _WIT['bytes'] += len(confirmed) - (len(previous) if previous else 0)
                            if not errs:
                                _WIT['locked'].add(clause)
        return errs

    go.search_clause, go.errors_of = search, errors_of
    return orig_search, orig_errors


def _restore_search_wrappers(orig):
    go.search_clause, go.errors_of = orig


def verify_witnesses(reference_v, entries):
    """Re-judge every captured KILLED/COVERED_LATER witness on the reference (unmemoized) copy."""
    idents = {}
    for location, info in go.walk(reference_v).items():
        for keyword in go.clauses_of(info['node']):
            idents[location + '/' + go.name_of(keyword)] = common.schema_guard(info['node'], keyword)
    passed = failed = unverifiable = 0
    failures = []
    for clause, entry in entries.items():
        if entry.get('cls') not in ('KILLED', 'COVERED_LATER'):
            continue
        raw = _WIT['store'].get(clause)
        ident = idents.get(clause)
        if raw is None or ident is None:
            unverifiable += 1
            continue
        value = pickle.loads(raw)
        guards = {getattr(e, 'oracle_guard', None) for e in go.errors_of(reference_v, value)}
        cut_errs = go.errors_of(reference_v, value, frozenset({ident}))
        cut_guards = {getattr(e, 'oracle_guard', None) for e in cut_errs}
        ok = ident in guards and ident not in cut_guards and (entry['cls'] != 'KILLED' or not cut_errs)
        if ok:
            passed += 1
        else:
            failed += 1
            failures.append(clause)
    return dict(passed=passed, failed=failed, unverifiable=unverifiable, failures=failures[:20],
                sampled=_WIT['sampled'])


def _fn_ref(fn):
    module, qual = getattr(fn, '__module__', None), getattr(fn, '__qualname__', None)
    if not module or not qual or '<locals>' in qual:
        return None
    try:
        obj = __import__(module, fromlist=['*'])
        for part in qual.split('.'):
            obj = getattr(obj, part)
    except (ImportError, AttributeError):
        return None
    return (module, qual) if obj is fn else None


def _import_ref(ref):
    module, qual = ref
    obj = __import__(module, fromlist=['*'])
    for part in qual.split('.'):
        obj = getattr(obj, part)
    return obj


_DIALECTS = ('Draft202012Validator', 'Draft201909Validator', 'Draft7Validator', 'Draft6Validator',
             'Draft4Validator', 'Draft3Validator')


def _class_recipe(cls):
    validators = {}
    for name, fn in cls.VALIDATORS.items():
        ref = _fn_ref(fn)
        if ref is None:
            return None
        validators[name] = ref
    # Stock dialect type checkers contain lambdas (jsonschema._types): name the
    # dialect whose mapping matches and store only differing, importable overrides.
    mine = cls.TYPE_CHECKER._type_checkers
    base_name, overrides = None, {}
    for dialect in _DIALECTS:
        stock = getattr(jsonschema, dialect).TYPE_CHECKER._type_checkers
        if set(stock) == set(mine) and all(stock[k] is mine[k] or _fn_ref(mine[k]) is not None for k in mine):
            base_name = dialect
            overrides = {k: _fn_ref(mine[k]) for k in mine if stock[k] is not mine[k]}
            break
    if base_name is None:
        return None
    return dict(validators=validators, meta_schema=cls.META_SCHEMA,
                type_checker_base=base_name, type_checkers=overrides)


def _rebuild_class(recipe):
    checker = getattr(jsonschema, recipe['type_checker_base']).TYPE_CHECKER
    for name, ref in recipe['type_checkers'].items():
        checker = checker.redefine(name, _import_ref(ref))
    return jsonschema.validators.create(meta_schema=recipe['meta_schema'],
                                          validators={k: _import_ref(r) for k, r in recipe['validators'].items()},
                                          type_checker=checker)


def _format_recipe(checker):
    if checker is common.FORMATS:
        return 'common.FORMATS'
    try:
        out = {}
        for name, (fn, raises) in checker.checkers.items():
            ref = _fn_ref(fn)
            exc = [_fn_ref(e) for e in raises]
            if ref is None or any(r is None for r in exc):
                return None
            out[name] = (ref, exc)
        return out
    except AttributeError:
        return None


def _rebuild_format(recipe):
    if recipe == 'common.FORMATS':
        return common.FORMATS
    return jsonschema.FormatChecker(checkers={name: (_import_ref(ref), tuple(_import_ref(e) for e in exc))
                                                for name, (ref, exc) in recipe.items()})


def _dump_entry(slot, ident):
    """GO2-style dump entry for one DG5 root: exact rebuild inputs + seeds + agree records.

    RootBank rebuilds through its own factory (exact class incl. dialect evolve);
    other plain-resolver banks rebuild from a validator-class recipe. Anything
    else is marked 'recollect' and never silently approximated. The rebuild is
    round-trip verified here against the recorded instances before it is trusted.
    """
    v, bank = slot['validator'], slot['bank_object']
    entry = dict(ident=ident, bank=slot['bank'], rows=sorted(slot.get('rows', ())),
                 families=sorted(slot['families']), calls=slot['calls'], refused=slot['refused'],
                 seeds=list(slot['seeds'].values()), seed_sha256=sorted(slot['seeds']),
                 records=slot['records'], schema=v.schema, rebuild='recollect', rebuild_note=None)
    resolver = v._resolver
    if type(resolver).__module__ != 'referencing._core':
        entry['rebuild_note'] = 'custom resolver ' + type(resolver).__qualname__
        return entry
    if type(bank).__qualname__ == 'RootBank' and isinstance(v.schema, dict) and set(v.schema) == {'$ref'}:
        entry['rebuild'] = 'rootbank'
        entry['rootbank'] = dict(documents=bank.documents, pins=bank.pins, root=v.schema['$ref'])
    else:
        recipe = _class_recipe(type(v))
        fmt = _format_recipe(v.format_checker)
        registry = resolver._registry
        if recipe is None or fmt is None or registry is None:
            entry['rebuild_note'] = 'validator class or format checker not importable by name'
            return entry
        entry['rebuild'] = 'recipe'
        entry['recipe'] = dict(cls=recipe, format=fmt, base=resolver._base_uri,
                               resources={uri: registry[uri].contents for uri in _plain_registry(registry)})
    try:
        plain = _rebuild_plain(entry)
        copy_v = closure_validator(plain, ident, None)
        bad = agree(plain, copy_v, slot['records'])
        entry['rebuild_agreement'] = dict(records=len(slot['records']), disagreements=len(bad))
        if bad:
            entry['rebuild'], entry['rebuild_note'] = 'recollect', f'rebuild disagrees on {len(bad)} records'
    except Exception as exc:  # noqa: BLE001 - a failed rebuild is recorded, never approximated
        entry['rebuild'] = 'recollect'
        entry['rebuild_note'] = 'rebuild failed: ' + type(exc).__name__ + ': ' + str(exc)[:300]
    return entry


def _rebuild_plain(entry):
    """The captured (pre-annotation) validator for a dump entry, rebuilt exactly."""
    if entry['rebuild'] == 'rootbank':
        import pm_goal_test_owner_adapters as adapters
        from referencing.jsonschema import DRAFT202012
        bank = adapters.RootBank.__new__(adapters.RootBank)
        bank.documents = entry['rootbank']['documents']
        bank.pins = entry['rootbank']['pins']
        bank.registry = Registry().with_resources(
            (uri, Resource.from_contents(doc, default_specification=DRAFT202012))
            for uri, doc in bank.documents.items()).crawl()
        return bank.validator(entry['rootbank']['root'])
    recipe = entry['recipe']
    cls = _rebuild_class(recipe['cls'])
    registry = Registry().with_resources(
        (uri, Resource(contents=c, specification=_spec_of(c))) for uri, c in recipe['resources'].items()).crawl()
    return cls(schema=entry['schema'], registry=registry, format_checker=_rebuild_format(recipe['format']),
               _resolver=registry.resolver(base_uri=recipe['base']))


def _spec_of(contents):
    from referencing.jsonschema import specification_with
    return specification_with(contents)


# ---------------------------------------------------------------- run

def collect(source, family):
    import pm_goal_dg5_sweep as dg5
    import pm_goal_guard_sweep as sweep
    import pm_goal_guard_tables as tables
    FAMILY[0] = family
    dg5.install(prove=False)
    tables.DISCOVERY = True
    module = __import__(source)
    hooks = getattr(module, 'closure_banks', None)
    for cls, method in (hooks() if hooks is not None else default_banks()):
        hook_bank(cls, method, family)
    collector = sweep.collect([source], fuzz=False, judge=False, keyword_witnesses=False)
    return collector


def root_id(key):
    return 'dg5:' + hashlib.sha256(json.dumps(key).encode()).hexdigest()[:16]


def _prepare_search_validator(ident, plain, bank_object, seeds, records, args):
    """Build and agree-check the reference and optional memo search validators."""
    v = closure_validator(plain, ident, bank_object)
    disagreements = agree(plain, v, records)
    meta = dict(agreement=dict(records=len(records), disagreement_count=len(disagreements),
                               disagreements=disagreements[:20]))
    if disagreements:
        raise ValueError(f'annotated copy disagrees with the original on {len(disagreements)} recorded instances')
    search_v, memo_note = v, 'off'
    if args.memo:
        candidate, memo_note = _memoised(v)
        if candidate is not v:
            bad = memo_agree(v, candidate, records, seeds)
            meta['memo_agreement'] = dict(instances=len(records) + len(seeds), disagreements=len(bad))
            if bad:
                memo_note = f'disagreed:{len(bad)}-fallback-reference'
            else:
                search_v = candidate
    meta['memo'] = memo_note
    meta['search_validator'] = 'memo' if search_v is not v else 'reference'
    return v, search_v, meta


def _agree_one(ident, plain, bank_object, seeds, records, args):
    """Run only the reference/memo agreement gate; take no search credit."""
    _reference_v, _search_v, meta = _prepare_search_validator(
        ident, plain, bank_object, seeds, records, args)
    meta['search_credit'] = 'none-agree-only'
    return meta


def _close_one(ident, plain, bank_object, seeds, records, args, carried):
    """Agree, (memo) search and witness-verify one root; returns (entries, meta)."""
    v, search_v, meta = _prepare_search_validator(ident, plain, bank_object, seeds, records, args)
    go.UNRESOLVED.clear()
    budget = args.budget or 10**12
    if args.per_clause:
        go.CURRENT[0] = search_v
        clauses = sum(len(go.clauses_of(info['node'])) for info in go.walk(search_v).values())
        budget = max(budget if args.budget else 0, args.per_clause * clauses)
    orig = _install_search_wrappers(v, search_v, args.sample_every)
    try:
        entries, branch_controls, spent = go.close_root(ident, search_v, seeds, budget, carried=carried or None)
    finally:
        _restore_search_wrappers(orig)
    meta['verify'] = verify_witnesses(v, entries)
    meta['branch_controls'] = branch_controls
    meta['validations'] = spent
    meta['budget'] = dict(budget=budget, clause_cap=args.clause_cap)
    meta['unresolved_refs'] = list(go.UNRESOLVED)
    if _WIT['store']:
        import gzip
        store_path = Path(str(args.out) + '.' + ident + '.witnesses.pkl.gz')
        blob = gzip.compress(pickle.dumps(_WIT['store'], protocol=5))
        store_path.write_bytes(blob)
        meta['witness_store'] = dict(path=store_path.name, sha256=hashlib.sha256(blob).hexdigest(),
                                     witnesses=len(_WIT['store']))
    return entries, meta


def _carried_from(paths):
    carried = {}
    for path in paths or ():
        report = json.loads(Path(path).read_text())
        for ident, entry in report.get('roots', {}).items():
            slot = carried.setdefault(ident, {})
            for clause, item in entry.get('clauses', {}).items():
                if item.get('cls') != 'UNCOVERED':
                    slot[clause] = item
    return carried


def _main_from_dump(args):
    """GO2 split run: close dumped roots (one root per process via --roots) without re-collecting."""
    started = time.time()
    go.CLAUSE_CAP[0] = args.clause_cap
    carried = _carried_from(args.carry)
    data = pickle.loads(args.from_dump.read_bytes())
    part, total = map(int, args.shard.split('/'))
    report = dict(method=__doc__.split('\n\n')[0], closure_tool='scripts/pm_goal_go_schema_closure.py',
                  closure_tool_sha256=go.TOOL_SHA256, dg5_adapter_sha256=TOOL_SHA256,
                  source=data['meta'].get('source'), family=data['meta'].get('family'),
                  calls=data['meta'].get('calls'), collection_failures=[], roots={},
                  from_dump=dict(path=str(args.from_dump),
                                 sha256=hashlib.sha256(args.from_dump.read_bytes()).hexdigest()),
                  mode='agree-only' if args.agree_only else 'close',
                  native_execution='NOT_RUN')
    for number, ident in enumerate(sorted(data['roots'])):
        if number % total != part or (args.roots and not any(r in ident for r in args.roots)):
            continue
        dumped = data['roots'][ident]
        entry = dict(bank=dumped['bank'], rows=dumped['rows'], families=dumped['families'],
                     calls=dumped['calls'], refused=dumped['refused'], seeds=len(dumped['seeds']),
                     seed_sha256=dumped['seed_sha256'], rebuild=dumped['rebuild'],
                     rebuild_note=dumped.get('rebuild_note'), schema=json.dumps(dumped['schema'], sort_keys=True))
        report['roots'][ident] = entry
        if args.inventory_only:
            continue
        if dumped['rebuild'] == 'recollect':
            entry.update(error='recollect-required: ' + str(dumped.get('rebuild_note'))[:300],
                         counts={'UNCOVERED_ROOT_ERROR': 1},
                         clauses={ident + '/<root>': dict(cls='UNCOVERED', error='dump entry needs recollection')})
            continue
        try:
            plain = _rebuild_plain(dumped)
            if args.agree_only:
                meta = _agree_one(ident, plain, None, list(dumped['seeds']), dumped['records'], args)
                entry.update(meta, counts={}, clauses={}, agree_only=True)
                print(f'{ident} {dumped["bank"]}: agree-only memo={meta.get("memo")} '
                      f'memo_agreement={meta.get("memo_agreement")}', file=sys.stderr, flush=True)
                args.out.with_suffix('.partial.json').write_text(
                    json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
                continue
            entries, meta = _close_one(ident, plain, None, list(dumped['seeds']), dumped['records'],
                                       args, carried.get(ident))
        except Exception as exc:  # noqa: BLE001 - reported, never skipped
            entry.update(error=type(exc).__name__ + ': ' + str(exc)[:400], counts={'UNCOVERED_ROOT_ERROR': 1},
                         clauses={ident + '/<root>': dict(cls='UNCOVERED', error=str(exc)[:300])})
            print(f'{ident}: ERROR {exc!r}'[:300], file=sys.stderr, flush=True)
            continue
        counts = collections.Counter(e['cls'] for e in entries.values())
        entry.update(meta, counts=dict(counts), clauses=entries)
        print(f'{ident} {dumped["bank"]}: seeds={len(dumped["seeds"])} {dict(counts)} '
              f'memo={meta.get("memo")} verify={meta.get("verify")}', file=sys.stderr, flush=True)
        args.out.with_suffix('.partial.json').write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
    report['shard'] = args.shard
    report['seconds'] = round(time.time() - started, 1)
    totals = collections.Counter()
    for entry in report['roots'].values():
        totals.update(entry.get('counts', {}))
    report['totals'] = dict(totals)
    report['uncovered'] = sorted(c for r in report['roots'].values() for c, e in r.get('clauses', {}).items()
                                  if e['cls'] == 'UNCOVERED')
    args.out.write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
    print(json.dumps(dict(roots=len(report['roots']), totals=report['totals'],
                          uncovered=len(report['uncovered']), seconds=report['seconds'])))
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--source')
    parser.add_argument('--family')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--budget', type=int, default=0, help='root validation budget; 0 = unbounded (per-clause cap binds, GO2)')
    parser.add_argument('--per-clause', type=int, default=0)
    parser.add_argument('--clause-cap', type=int, default=900)
    parser.add_argument('--roots', nargs='*')
    parser.add_argument('--shard', default='0/1', help='i/n over whole roots (sorted ids); never splits one root')
    parser.add_argument('--inventory-only', action='store_true')
    parser.add_argument('--memo', action='store_true', help="search with GO2's memoizing validator (agree-gated)")
    parser.add_argument('--agree-only', action='store_true',
                        help='run reference/memo agreement trials and take no search credit')
    parser.add_argument('--sample-every', type=int, default=997, help='in-run memo/reference agreement sampling (0 = off)')
    parser.add_argument('--carry', action='append', type=Path, default=[],
                        help='earlier DG5 closure report(s): clauses not left UNCOVERED are carried, not re-searched')
    parser.add_argument('--seed-cap', type=int, default=24)
    parser.add_argument('--dump', type=Path, help='collect once and pickle GO2-style root dumps here, then exit')
    parser.add_argument('--from-dump', type=Path, help='close roots from a --dump pickle instead of collecting')
    args = parser.parse_args()
    if args.from_dump:
        return _main_from_dump(args)
    if not args.source or not args.family:
        parser.error('--source and --family are required unless --from-dump is given')
    started = time.time()
    go.CLAUSE_CAP[0] = args.clause_cap
    global SEED_CAP
    SEED_CAP = args.seed_cap
    carried = _carried_from(args.carry)
    collector = collect(args.source, args.family)
    part, total = map(int, args.shard.split('/'))
    report = dict(method=__doc__.split('\n\n')[0], closure_tool='scripts/pm_goal_go_schema_closure.py',
                  closure_tool_sha256=go.TOOL_SHA256, dg5_adapter_sha256=TOOL_SHA256, source=args.source,
                  family=args.family, calls=collector.calls, collection_failures=collector.failures, roots={},
                  native_execution='NOT_RUN')
    ordered = sorted(SLOTS.items(), key=lambda item: root_id(item[0]))
    report['all_roots'] = {root_id(k): dict(bank=s['bank'], schema=k[1][:300], calls=s['calls'], refused=s['refused'],
                                            rows=sorted(s.get('rows', ())),
                                            seeds=len(s['seeds']), families=sorted(s['families'])) for k, s in ordered}
    if args.dump:
        dumped = {}
        for key, slot in ordered:
            ident = root_id(key)
            if args.roots and not any(r in ident or r in key[1] for r in args.roots):
                continue
            dumped[ident] = _dump_entry(slot, ident)
            print(f"{ident} dump rebuild={dumped[ident]['rebuild']} seeds={len(dumped[ident]['seeds'])} "
                  f"note={dumped[ident].get('rebuild_note')}", file=sys.stderr, flush=True)
        blob = pickle.dumps(dict(meta=dict(source=args.source, family=args.family, calls=collector.calls,
                                           seed_cap=args.seed_cap, tool_sha256=TOOL_SHA256,
                                           seconds=round(time.time() - started, 1)), roots=dumped), protocol=5)
        args.dump.write_bytes(blob)
        print(json.dumps(dict(dump=str(args.dump), roots={i: e['rebuild'] for i, e in dumped.items()},
                              sha256=hashlib.sha256(blob).hexdigest())))
        return 0
    for number, (key, slot) in enumerate(ordered):
        ident = root_id(key)
        if number % total != part or (args.roots and not any(r in ident or r in key[1] for r in args.roots)):
            continue
        entry = dict(bank=slot['bank'], validator_class=key[0], schema=key[1], registry_sha256=key[2],
                     rows=sorted(slot.get('rows', ())),
                     families=sorted(slot['families']), calls=slot['calls'], refused=slot['refused'],
                     seeds=len(slot['seeds']), seed_sha256=sorted(slot['seeds']))
        report['roots'][ident] = entry
        if args.inventory_only:
            continue
        try:
            entries, meta = _close_one(ident, slot['validator'], slot['bank_object'],
                                       list(slot['seeds'].values()), slot['records'], args,
                                       carried.get(ident))
        except Exception as exc:  # noqa: BLE001 - a root that cannot be closed is reported, never skipped
            entry.update(error=type(exc).__name__ + ': ' + str(exc)[:400], counts={'UNCOVERED_ROOT_ERROR': 1},
                         clauses={ident + '/<root>': dict(cls='UNCOVERED', error=str(exc)[:300])})
            print(f'{ident}: ERROR {exc!r}'[:300], file=sys.stderr, flush=True)
            slot['records'] = []
            slot['seeds'] = {}
            continue
        counts = collections.Counter(e['cls'] for e in entries.values())
        entry.update(meta, counts=dict(counts), clauses=entries)
        print(f'{ident} {slot["bank"]} {key[1][:80]}: seeds={len(slot["seeds"])} {dict(counts)}', file=sys.stderr,
              flush=True)
        args.out.with_suffix('.partial.json').write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
        slot['records'] = []  # agreement + closure for this root are done; free its retained instances
        slot['seeds'] = {}
    report['shard'] = args.shard
    report['seconds'] = round(time.time() - started, 1)
    totals = collections.Counter()
    for entry in report['roots'].values():
        totals.update(entry.get('counts', {}))
    report['totals'] = dict(totals)
    report['uncovered'] = sorted(c for r in report['roots'].values() for c, e in r.get('clauses', {}).items()
                                 if e['cls'] == 'UNCOVERED')
    args.out.write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
    print(json.dumps(dict(roots=len(report['roots']), totals=report['totals'], uncovered=len(report['uncovered']),
                          seconds=report['seconds'])))
    return 0


if __name__ == '__main__':
    sys.exit(main())
