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


_SCANNED = [0]


def patch_validator_classes():
    """Every validator class reachable as a module attribute of a Goal checker module, and jsonschema's own."""
    if len(sys.modules) == _SCANNED[0]:
        return
    _SCANNED[0] = len(sys.modules)
    for value in vars(jsonschema.validators).values():
        if _is_validator_class(value):
            _patch_class(value)
    for module in tuple(sys.modules.values()):
        name = getattr(module, '__name__', '')
        if not name.startswith(('pm_goal', 'pm_event')) or name.startswith(('pm_goal_phase_', 'pm_goal_table_')):
            continue
        for value in list(vars(module).values()):
            if _is_validator_class(value):
                _patch_class(value)


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
            refused = bool(result)
            slot['refused'] += refused
            try:
                raw = pickle.dumps(value, protocol=5)
                sha = hashlib.sha256(raw).hexdigest()
            except Exception:  # noqa: BLE001 - an unpicklable instance is never a seed or record
                return result
            if not refused and len(slot['seeds']) < SEED_CAP:
                slot['seeds'].setdefault(sha, copy.deepcopy(value))
            if len(slot['records']) < RECORD_CAP and all(r[0] != sha for r in slot['records']):
                slot['records'].append((sha, copy.deepcopy(value), _signature(result)))
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
    for sha, value, expected in records:
        got = _signature(copy_v.iter_errors(value))
        if got != expected:
            bad.append(dict(input_sha256=sha, original=expected[:6], copy=got[:6]))
    return bad


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


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--source', required=True)
    parser.add_argument('--family', required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--budget', type=int, default=40000)
    parser.add_argument('--per-clause', type=int, default=0)
    parser.add_argument('--clause-cap', type=int, default=900)
    parser.add_argument('--roots', nargs='*')
    parser.add_argument('--shard', default='0/1', help='i/n over whole roots (sorted ids); never splits one root')
    parser.add_argument('--inventory-only', action='store_true')
    args = parser.parse_args()
    started = time.time()
    go.CLAUSE_CAP[0] = args.clause_cap
    collector = collect(args.source, args.family)
    part, total = map(int, args.shard.split('/'))
    report = dict(method=__doc__.split('\n\n')[0], closure_tool='scripts/pm_goal_go_schema_closure.py',
                  closure_tool_sha256=go.TOOL_SHA256, dg5_adapter_sha256=TOOL_SHA256, source=args.source,
                  family=args.family, calls=collector.calls, collection_failures=collector.failures, roots={},
                  native_execution='NOT_RUN')
    ordered = sorted(SLOTS.items(), key=lambda item: root_id(item[0]))
    report['all_roots'] = {root_id(k): dict(bank=s['bank'], schema=k[1][:300], calls=s['calls'], refused=s['refused'],
                                            seeds=len(s['seeds']), families=sorted(s['families'])) for k, s in ordered}
    for number, (key, slot) in enumerate(ordered):
        ident = root_id(key)
        if number % total != part or (args.roots and not any(r in ident or r in key[1] for r in args.roots)):
            continue
        entry = dict(bank=slot['bank'], validator_class=key[0], schema=key[1], registry_sha256=key[2],
                     families=sorted(slot['families']), calls=slot['calls'], refused=slot['refused'],
                     seeds=len(slot['seeds']), seed_sha256=sorted(slot['seeds']))
        report['roots'][ident] = entry
        if args.inventory_only:
            continue
        try:
            v = closure_validator(slot['validator'], ident, slot['bank_object'])
            disagreements = agree(slot['validator'], v, slot['records'])
            entry['agreement'] = dict(records=len(slot['records']), disagreements=disagreements[:20],
                                      disagreement_count=len(disagreements))
            if disagreements:
                raise ValueError(f'annotated copy disagrees with the original on {len(disagreements)} recorded instances')
            seeds = list(slot['seeds'].values())
            go.UNRESOLVED.clear()
            budget = args.budget
            if args.per_clause:
                go.CURRENT[0] = v
                clauses = sum(len(go.clauses_of(info['node'])) for info in go.walk(v).values())
                budget = max(budget, args.per_clause * clauses)
            entries, branch_controls, spent = go.close_root(ident, v, seeds, budget)
        except Exception as exc:  # noqa: BLE001 - a root that cannot be closed is reported, never skipped
            entry.update(error=type(exc).__name__ + ': ' + str(exc)[:400], counts={'UNCOVERED_ROOT_ERROR': 1},
                         clauses={ident + '/<root>': dict(cls='UNCOVERED', error=str(exc)[:300])})
            print(f'{ident}: ERROR {exc!r}'[:300], file=sys.stderr, flush=True)
            continue
        counts = collections.Counter(e['cls'] for e in entries.values())
        entry.update(branch_controls=branch_controls, validations=spent, counts=dict(counts), clauses=entries,
                     unresolved_refs=list(go.UNRESOLVED), budget=dict(budget=budget, clause_cap=args.clause_cap))
        print(f'{ident} {slot["bank"]} {key[1][:80]}: seeds={len(slot["seeds"])} {dict(counts)}', file=sys.stderr,
              flush=True)
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
    print(json.dumps(dict(roots=len(report['roots']), totals=report['totals'], uncovered=len(report['uncovered']),
                          seconds=report['seconds'])))
    return 0


if __name__ == '__main__':
    sys.exit(main())
