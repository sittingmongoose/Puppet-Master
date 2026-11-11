#!/usr/bin/env python3
"""R1 demonstration on the shared TEST_ONLY owner adapters (goal_run.cancelled).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Judge R1 (older scoped-routing qualification): qualify the entire older
cancelled consumer bank, including unused definitions, and bind only the exact
retained-Handoff edge (source whole hash, both original file retrieval
aliases, eleven JSON-pointer locations and literals, target URI and hash),
with nested resolution kept in ``retained_original_d05``. Every method that
selects the successor names its bank, import and profile explicitly.

On the shared framework:

* ``RealmOwner`` (one registered owner per realm) loads each pinned resource
  by its SHA-256 from the repository, wherever the exact bytes now live, and
  never rewrites or restamps a bank, URI or hash.
* ``RouteOwner`` derives the edge from the source bytes and issues it.
* ``SelectionOwner`` issues the successor selection and one explicit
  per-method selection.
* ``Qualifier`` acquires all of them through the registry and walks every
  ``$ref`` of every resource in every realm with location-scoped dispatch.

Positive: zero unresolved references in the successor composition, exactly
22 crossing sites at the 11 listed locations under 2 aliases, and the
predecessor's 22 unresolved sites preserved. Negatives change one field of
the issued route or selection (or substitute its issuer) and must refuse.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
from pathlib import Path
import sys
from urllib.parse import urldefrag, urljoin

from referencing import Registry, Resource
from referencing.exceptions import Unresolvable
from referencing.jsonschema import DRAFT202012

import pm_goal_test_numrule as NR
import pm_goal_test_owner_adapters as A

ROOT = NR.ROOT
QUALIFICATION = 'TEST_ONLY'
PREDECESSOR = dict(path='Plans/goal_run_cancelled_consumer_schema_resources.json',
                   sha256='b616a2b1c219dceb152f1d67fee0b23a00afe8c98c0e821bff04a2592704869c')
TARGET_MANIFEST = dict(path='Plans/goal_run_certified_consumer_contracts/resource-realms.json',
                       sha256='37bbb87f92c86add8555e8f35498b4e609bd270fe38941396ff2fba72896ea66')
METHODS = dict(path='Plans/goal_run_cancelled_consumer_contracts/methods.json',
               sha256='5a44e6eafffb116ee0210c2decf199734d7699dd2d8a15a5afd44bb571b7d6d2')
SOURCE_REALM, TARGET_REALM = 'native_consumer', 'retained_original_d05'
TARGET_URI = ('file:///home/sittingmongoose/PM-Experiments/goal-completed-sixteen-input-composition-20260913/v6/'
              'frozen/completion-v5/frozen/completion-v4/inputs/Plans/plans_to_code_handoff.schema.json')
TARGET_SHA = '1b1cff7b32b90f22734e90f025c020a05f9145fbea82ce156cb2224611ce8d4d'
PROFILE = 'TEST_ONLY:goal_run_cancelled.older_scoped_routing.successor.v1'
DYNAMIC = ('$dynamicRef', '$recursiveRef', '$dynamicAnchor', '$recursiveAnchor')


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def pinned(pin):
    raw = (ROOT / pin['path']).read_bytes()
    A.require('pin/' + pin['path'], sha(raw) == pin['sha256'])
    return json.loads(raw)


def pointer(value, location):
    location = location.lstrip('#')
    for key in location.split('/')[1:] if location else ():
        key = key.replace('~1', '/').replace('~0', '~')
        value = value[int(key)] if isinstance(value, list) else value[key]
    return value


def esc(key):
    return key.replace('~', '~0').replace('/', '~1')


MAP_KEYWORDS = ('$defs', 'definitions', 'properties', 'patternProperties', 'dependentSchemas')
ONE_KEYWORDS = ('additionalProperties', 'unevaluatedProperties', 'contains', 'propertyNames', 'not', 'if', 'then',
                'else', 'unevaluatedItems', 'additionalItems')
LIST_KEYWORDS = ('allOf', 'anyOf', 'oneOf', 'prefixItems')


def children(node):
    """Every subschema position of the JSON Schema dialects in these banks.

    Unused ``$defs`` are included. Data under unknown keywords (for example an
    embedded ``legacy_v2_reader`` document, ``const``, ``examples``) is never a
    schema position, so a ``$ref`` string inside it is not a reference.
    """
    for keyword in MAP_KEYWORDS:
        value = node.get(keyword)
        if isinstance(value, dict):
            for key, child in value.items():
                if isinstance(child, dict):
                    yield '/' + keyword + '/' + esc(key), child
    for keyword in ONE_KEYWORDS:
        value = node.get(keyword)
        if isinstance(value, dict):
            yield '/' + keyword, value
    for keyword in LIST_KEYWORDS:
        value = node.get(keyword)
        if isinstance(value, list):
            for i, child in enumerate(value):
                if isinstance(child, dict):
                    yield '/%s/%d' % (keyword, i), child
    items = node.get('items')
    if isinstance(items, dict):
        yield '/items', items
    elif isinstance(items, list):
        for i, child in enumerate(items):
            if isinstance(child, dict):
                yield '/items/%d' % i, child
    deps = node.get('dependencies')
    if isinstance(deps, dict):
        for key, child in deps.items():
            if isinstance(child, dict):
                yield '/dependencies/' + esc(key), child


_CONTENT = None


def content_index():
    """SHA-256 -> repository path for every JSON file under Plans (no shards/index)."""
    global _CONTENT
    if _CONTENT is None:
        _CONTENT = {}
        for base, dirs, files in os.walk(ROOT / 'Plans'):
            dirs[:] = [d for d in dirs if d not in ('_shards', '.plan_index', '.evidence')]
            for name in files:
                if name.endswith('.json'):
                    path = Path(base) / name
                    _CONTENT.setdefault(sha(path.read_bytes()), path)
    return _CONTENT


class RealmOwner(A.TestOwner):
    """Issues one whole isolated realm bank; keeps its documents privately."""
    role = 'resource_realm'
    custody_codec = 'exact_json'

    def load(self, manifest_pin, realm, declarations=None):
        with self.recorder.call(self.owner_id, 'load_realm', dict(manifest=manifest_pin, realm=realm)) as slot:
            manifest = pinned(manifest_pin)
            declaration = (manifest.get('realms') or manifest)[realm] if declarations is None else declarations
            A.require('realm/no_network', declaration.get('network_fallback') is False)
            A.require('realm/no_merge', declaration.get('merge_with_other_realms') is False)
            documents, origins, rows = {}, {}, []
            index = content_index()
            for entry in declaration['resources']:
                path = index.get(entry['sha256'])
                A.require('realm/resource_bytes/' + entry['retrieval_uri'], path is not None)
                raw = path.read_bytes()
                A.require('realm/resource_hash', sha(raw) == entry['sha256'])
                origin = (entry['sha256'], entry.get('json_pointer', ''))
                uri = entry['retrieval_uri']
                A.require('realm/no_rebinding/' + uri, uri not in origins or origins[uri] == origin)
                documents[uri] = pointer(json.loads(raw), entry.get('json_pointer', ''))
                origins[uri] = origin
                rows.append(dict(retrieval_uri=uri, sha256=entry['sha256'], json_pointer=entry.get('json_pointer', ''),
                                 located=str(path.relative_to(ROOT))))
            record = dict(qualification=QUALIFICATION, manifest=manifest_pin, realm=realm, resources=rows)
            handle = self._issue(None, record, kind='realm_bank')
            self._documents = getattr(self, '_documents', {})
            self._documents[self._handles[handle]] = (documents, origins)
            slot.set(dict(realm=realm, resources=len(rows)))
            return handle

    def documents(self, handle):
        ref = self._ref(handle)
        documents, origins = self._documents[ref]
        return copy.deepcopy(documents), dict(origins)


class RouteOwner(A.TestOwner):
    role = 'scoped_route'
    custody_codec = 'exact_json'

    def derive(self, registry, source_realm_handle, target_realm_handle, route_edit=None):
        with self.recorder.call(self.owner_id, 'derive_scoped_route') as slot:
            src_owner = registry.owner(source_realm_handle[0], 'resource_realm')
            tgt_owner = registry.owner(target_realm_handle[0], 'resource_realm')
            src_ref, src = src_owner.resolve(source_realm_handle[1])
            _, tgt = tgt_owner.resolve(target_realm_handle[1])
            documents, origins = src_owner.documents(source_realm_handle[1])
            sites, aliases, source_sha = {}, [], None
            for uri, document in documents.items():
                found = []

                def walk(node, path, base):
                    if '$id' in node and path:
                        base = urljoin(base, node['$id'])
                    if isinstance(node.get('$ref'), str) and \
                            urldefrag(urljoin(base, node['$ref']))[0] == TARGET_URI:
                        found.append((path + '/$ref', node['$ref']))
                    for sub, child in children(node):
                        walk(child, path + sub, base)
                walk(document, '', urljoin(uri, document.get('$id', '')) if isinstance(document, dict) else uri)
                if found:
                    A.require('route/one_source_resource', source_sha in (None, origins[uri][0]))
                    source_sha = origins[uri][0]
                    aliases.append(uri)
                    for location, literal in found:
                        A.require('route/same_literal_per_alias', sites.setdefault(location, literal) == literal)
            target_rows = [r for r in tgt['resources'] if r['retrieval_uri'] == TARGET_URI]
            A.require('route/target_unique', len(target_rows) == 1)
            route = dict(qualification=QUALIFICATION, source_realm=src['realm'], source_manifest=src['manifest'],
                         source_whole_sha256=source_sha, source_retrieval_aliases=sorted(aliases),
                         sites=[dict(schema_location=k, literal_reference=v) for k, v in sorted(sites.items())],
                         target_realm=tgt['realm'], target_manifest=tgt['manifest'], absolute_target_uri=TARGET_URI,
                         target_whole_sha256=target_rows[0]['sha256'], nested_resolution=tgt['realm'],
                         network_fallback=False, whole_bank_merge=False)
            if route_edit:
                route = route_edit(route)
            handle = self._issue(None, route, kind='scoped_route')
            slot.set(dict(sites=len(route['sites']), aliases=len(route['source_retrieval_aliases'])))
            return handle


class SelectionOwner(A.TestOwner):
    role = 'successor_selection'
    custody_codec = 'exact_json'

    def select(self, route_ref, route_sha, realms, methods, selection_edit=None, method_edit=None):
        with self.recorder.call(self.owner_id, 'issue_successor_selection') as slot:
            selection = dict(qualification=QUALIFICATION, profile=PROFILE, predecessor=PREDECESSOR,
                             target_manifest=TARGET_MANIFEST, realms=sorted(realms), route_ref=route_ref,
                             route_sha256=route_sha, method_map=METHODS)
            if selection_edit:
                selection = selection_edit(selection)
            handle = self._issue(None, selection, kind='successor_selection')
            per_method = {}
            for m in methods:
                record = dict(qualification=QUALIFICATION, method=m['method'], bank=PROFILE + ':bank',
                              import_ref=route_ref, profile=PROFILE, selection_ref=self._handles[handle])
                if method_edit:
                    record = method_edit(record)
                per_method[m['method']] = self._issue(None, record, kind='method_selection')
            slot.set(dict(profile=selection['profile'], methods=len(per_method)))
            return handle, per_method


class Qualifier(A.TestOwner):
    role = 'qualifier'

    def __init__(self, registry, **kw):
        super().__init__(registry, **kw)
        self.observations = {}

    def _registries(self, realm_handles):
        reg = self.registry
        out = {}
        for owner_id, handle in realm_handles:
            owner = reg.owner(owner_id, 'resource_realm')
            ref, record = owner.resolve(handle)
            documents, origins = owner.documents(handle)
            registry = Registry().with_resources(
                (uri, Resource.from_contents(doc, default_specification=DRAFT202012)) for uri, doc in documents.items())
            out[record['realm']] = dict(record=record, ref=ref, documents=documents, origins=origins,
                                        registry=registry.crawl())
        return out

    def _check_route(self, realms, route):
        A.require('route/no_network', route['network_fallback'] is False)
        A.require('route/no_merge', route['whole_bank_merge'] is False)
        A.require('route/source_realm', route['source_realm'] == SOURCE_REALM and route['source_realm'] in realms
                  and route['source_manifest'] == PREDECESSOR)
        A.require('route/target_realm', route['target_realm'] == TARGET_REALM and route['target_realm'] in realms
                  and route['target_manifest'] == TARGET_MANIFEST)
        A.require('route/nested_resolution', route['nested_resolution'] == route['target_realm'])
        src = realms[route['source_realm']]
        hosted = sorted(uri for uri, origin in src['origins'].items() if origin[0] == route['source_whole_sha256'])
        A.require('route/source_hash', bool(hosted))
        A.require('route/source_aliases', set(route['source_retrieval_aliases']) <= set(hosted)
                  and len(route['source_retrieval_aliases']) == len(set(route['source_retrieval_aliases'])))
        document = src['documents'][route['source_retrieval_aliases'][0]]
        for site in route['sites']:
            try:
                literal = pointer(document, site['schema_location'])
            except (KeyError, IndexError, ValueError, TypeError):
                literal = None
            A.require('route/site_literal', literal == site['literal_reference'])
        target_origin = realms[route['target_realm']]['origins'].get(route['absolute_target_uri'])
        A.require('route/target_binding', target_origin is not None and target_origin[1] == '')
        A.require('route/target_hash', target_origin[0] == route['target_whole_sha256'] == TARGET_SHA)

    def qualify(self, realm_handles, route_handle=None, selection_handle=None):
        """Eager whole-bank walk; returns per-realm counts and unresolved sites."""
        with self.recorder.call(self.owner_id, 'qualify_eagerly',
                                dict(realms=len(realm_handles), routed=route_handle is not None)) as slot:
            realms = self._registries(realm_handles)
            route = None
            if route_handle is not None:
                route_owner = self.registry.owner(route_handle[0], 'scoped_route')
                route_ref, route = route_owner.resolve(route_handle[1])
                if selection_handle is not None:
                    sel_owner = self.registry.owner(selection_handle[0], 'successor_selection')
                    _, selection = sel_owner.resolve(selection_handle[1])
                    A.require('selection/profile', selection['profile'] == PROFILE)
                    A.require('selection/predecessor', selection['predecessor'] == PREDECESSOR)
                    A.require('selection/target_manifest', selection['target_manifest'] == TARGET_MANIFEST)
                    A.require('selection/route_ref', selection['route_ref'] == route_ref)
                    A.require('selection/route_sha256', selection['route_sha256'] ==
                              route_owner.custody(route_handle[1])['sha256'])
                    A.require('selection/realms', selection['realms'] == sorted(realms))
                self._check_route(realms, route)
            allowed = {} if route is None else {
                (route['source_realm'], uri, s['schema_location']): s['literal_reference']
                for uri in route['source_retrieval_aliases'] for s in route['sites']}
            rows, unresolved, crossings = {}, [], []
            for realm, data in sorted(realms.items()):
                count = dict(resources=len(data['documents']), reference_sites=0, cross_realm_sites=0, unresolved=0)
                for uri, document in data['documents'].items():
                    resolver = data['registry'].resolver(uri)

                    def walk(node, path, resolver):
                        if isinstance(node, dict):
                            for keyword in DYNAMIC:
                                A.require('qualify/unsupported_dynamic_reference', keyword not in node)
                            if '$id' in node and path:
                                resolver = resolver.in_subresource(
                                    Resource.from_contents(node, default_specification=DRAFT202012))
                            if isinstance(node.get('$ref'), str):
                                count['reference_sites'] += 1
                                literal = node['$ref']
                                absolute = urldefrag(urljoin(resolver._base_uri, literal))[0]
                                key = (realm, uri, path + '/$ref')
                                if absolute == TARGET_URI and realm == SOURCE_REALM:
                                    if allowed.get(key) == literal:
                                        # Nested resolution stays in the retained realm's own registry.
                                        tgt = realms[route['target_realm']]['registry']
                                        try:
                                            tgt.resolver().lookup(urljoin(resolver._base_uri, literal))
                                        except Unresolvable:
                                            count['unresolved'] += 1
                                            unresolved.append(dict(realm=realm, uri=uri, location=path + '/$ref',
                                                                   literal=literal, crossing=True))
                                        else:
                                            count['cross_realm_sites'] += 1
                                            crossings.append(dict(source_uri=uri, location=path + '/$ref',
                                                                  literal=literal))
                                    else:
                                        count['unresolved'] += 1
                                        unresolved.append(dict(realm=realm, uri=uri, location=path + '/$ref',
                                                               literal=literal))
                                else:
                                    try:
                                        resolver.lookup(literal)
                                    except Unresolvable:
                                        count['unresolved'] += 1
                                        unresolved.append(dict(realm=realm, uri=uri, location=path + '/$ref',
                                                               literal=literal))
                            for sub, child in children(node):
                                walk(child, path + sub, resolver)
                    walk(document, '', resolver)
                rows[realm] = count
            used = {(c['source_uri'], c['location']) for c in crossings}
            A.require('qualify/route_site_unused', route is None or used == {(u, l[2]) for l in allowed for u in [l[1]]})
            result = dict(rows=rows, unresolved=unresolved, crossings=len(crossings),
                          distinct_unresolved=sorted({u['literal'] for u in unresolved}))
            slot.set(dict(rows=rows, crossings=len(crossings), unresolved=len(unresolved)))
            return result

    def dispatch(self, method_name, method_handle, selection_handle, route_handle, realms_q):
        """A method resolves its roots only through its explicit successor selection."""
        with self.recorder.call(self.owner_id, 'dispatch:' + method_name) as slot:
            sel_owner = self.registry.owner(selection_handle[0], 'successor_selection')
            A.require('method/selection_handle', type(method_handle) is A.OriginalHandle)
            _, record = sel_owner.resolve(method_handle)
            selection_ref, _ = sel_owner.resolve(selection_handle[1])
            route_ref = self.registry.owner(route_handle[0], 'scoped_route').resolve(route_handle[1])[0]
            A.require('method/name', record['method'] == method_name)
            A.require('method/profile', record['profile'] == PROFILE)
            A.require('method/bank', record['bank'] == PROFILE + ':bank')
            A.require('method/import', record['import_ref'] == route_ref)
            A.require('method/selection', record['selection_ref'] == selection_ref)
            A.require('method/qualified', realms_q['unresolved'] == [])
            slot.set(record)
            return record


def build(route_edit=None, selection_edit=None, method_edit=None, substitute=None):
    registry = A.OwnerRegistry()
    owners = {}
    realm_handles = []
    predecessor = pinned(PREDECESSOR)
    for realm in sorted(predecessor['realms']):
        owner = RealmOwner(registry)
        realm_handles.append((owner.owner_id, owner.load(PREDECESSOR, realm)))
        owners[realm] = owner
    target_owner = RealmOwner(registry)
    target_handle = (target_owner.owner_id, target_owner.load(TARGET_MANIFEST, TARGET_REALM))
    source_handle = next(h for h in realm_handles if owners[SOURCE_REALM].owner_id == h[0])
    route_owner = RouteOwner(registry)
    route_handle = (route_owner.owner_id, route_owner.derive(registry, source_handle, target_handle, route_edit))
    if substitute == 'route_unregistered':
        rogue = RouteOwner(A.OwnerRegistry())
        route_handle = (rogue.owner_id, rogue.derive(registry, source_handle, target_handle))
    if substitute == 'route_transport_dict':
        route_handle = (route_owner.owner_id, route_owner.resolve(route_handle[1])[1])
    methods = pinned(METHODS)['methods']
    selection_owner = SelectionOwner(registry)
    route_ref = route_owner._handles.get(route_handle[1]) if type(route_handle[1]) is A.OriginalHandle else None
    route_sha = route_owner.custody(route_handle[1])['sha256'] if route_ref else '0' * 64
    selection, per_method = selection_owner.select(route_ref or 'TEST_ONLY:none', route_sha,
                                                   [r for r in predecessor['realms']] + [TARGET_REALM], methods,
                                                   selection_edit, method_edit)
    selection_handle = (selection_owner.owner_id, selection)
    return registry, realm_handles + [target_handle], route_handle, selection_handle, per_method, methods


def positive():
    registry, realms, route, selection, per_method, methods = build()
    qualifier = Qualifier(registry)
    predecessor = qualifier.qualify(realms[:-1])
    A.require('positive/predecessor_failure_preserved', len(predecessor['unresolved']) == 22 and
              len(predecessor['distinct_unresolved']) == 11 and
              all(u['realm'] == SOURCE_REALM for u in predecessor['unresolved']))
    successor = qualifier.qualify(realms, route, selection)
    A.require('positive/zero_unresolved', successor['unresolved'] == [])
    A.require('positive/exact_crossings', successor['crossings'] == 22 and
              successor['rows'][SOURCE_REALM]['cross_realm_sites'] == 22)
    A.require('positive/other_realms_no_crossing', all(r['cross_realm_sites'] == 0 for k, r in successor['rows'].items()
                                                       if k != SOURCE_REALM))
    route_value = registry.owner(route[0], 'scoped_route').resolve(route[1])[1]
    A.require('positive/eleven_sites_two_aliases', len(route_value['sites']) == 11 and
              len(route_value['source_retrieval_aliases']) == 2)
    dispatched = [qualifier.dispatch(m['method'], per_method[m['method']], selection, route, successor)
                  for m in methods]
    A.require('positive/every_method_explicit', len(dispatched) == len(methods) == 6)
    order = [m for _, m in registry.recorder.sequence(True)]
    A.require('positive/order', order.index('derive_scoped_route') < order.index('issue_successor_selection') <
              order.index('qualify_eagerly'))
    return dict(predecessor=dict(unresolved=len(predecessor['unresolved']),
                                 distinct=len(predecessor['distinct_unresolved'])),
                successor=successor['rows'], crossings=successor['crossings'],
                route=dict(source_whole_sha256=route_value['source_whole_sha256'],
                           aliases=route_value['source_retrieval_aliases'], sites=len(route_value['sites']),
                           target=route_value['absolute_target_uri'], target_sha256=route_value['target_whole_sha256']),
                methods=[d['method'] for d in dispatched], recorder=registry.recorder.export())


def negative(build_kwargs, *, method_name=None, method_override=None):
    registry, realms, route, selection, per_method, methods = build(**build_kwargs)
    qualifier = Qualifier(registry)
    result = qualifier.qualify(realms, route, selection)
    A.require('qualify/unresolved', result['unresolved'] == [])
    for m in methods:
        handle = per_method[m['method']] if method_override is None else method_override(per_method, m['method'])
        qualifier.dispatch(method_name or m['method'], handle, selection, route, result)


def site_edit(index, **change):
    def run(route):
        route['sites'][index].update(change)
        return route
    return run


def cases():
    other = '/$defs/OriginalCompletionInput/properties/receipt/$ref'
    return [
        ('wrong_source_realm', dict(route_edit=lambda r: dict(r, source_realm='goal_consumer')), 'route/source_realm'),
        ('wrong_target_realm_merge', dict(route_edit=lambda r: dict(r, target_realm=SOURCE_REALM,
                                                                   nested_resolution=SOURCE_REALM)),
         'route/target_realm'),
        ('nested_resolution_escapes', dict(route_edit=lambda r: dict(r, nested_resolution=SOURCE_REALM)),
         'route/nested_resolution'),
        ('wrong_location', dict(route_edit=site_edit(0, schema_location='/$defs/OriginalCompletionInput/$ref')),
         'route/site_literal'),
        ('wrong_literal', dict(route_edit=site_edit(1, literal_reference='inputs/Plans/other.schema.json#/$defs/x')),
         'route/site_literal'),
        ('swapped_location_literal', dict(route_edit=lambda r: (r['sites'][0].update(
            literal_reference=r['sites'][1]['literal_reference']), r)[1]), 'route/site_literal'),
        ('dropped_site', dict(route_edit=lambda r: dict(r, sites=r['sites'][1:])), 'qualify/unresolved'),
        ('wrong_source_hash', dict(route_edit=lambda r: dict(r, source_whole_sha256='0' * 64)), 'route/source_hash'),
        ('wrong_alias', dict(route_edit=lambda r: dict(r, source_retrieval_aliases=[
            r['source_retrieval_aliases'][0], 'https://puppetmaster.local/proposals/native_worknode_source.v1.schema.json'])),
         'route/source_aliases'),
        ('dropped_alias', dict(route_edit=lambda r: dict(r, source_retrieval_aliases=r['source_retrieval_aliases'][:1])),
         'qualify/unresolved'),
        ('wrong_target_uri', dict(route_edit=lambda r: dict(r, absolute_target_uri=TARGET_URI.replace('completion-v4', 'completion-v3'))),
         'route/target_binding'),
        ('wrong_target_hash', dict(route_edit=lambda r: dict(r, target_whole_sha256='0' * 64)), 'route/target_hash'),
        ('network_fallback', dict(route_edit=lambda r: dict(r, network_fallback=True)), 'route/no_network'),
        ('whole_bank_merge', dict(route_edit=lambda r: dict(r, whole_bank_merge=True)), 'route/no_merge'),
        ('route_unregistered_owner', dict(substitute='route_unregistered'), 'registry/unregistered_owner'),
        ('route_transport_dict', dict(substitute='route_transport_dict'), 'original/handle_type'),
        ('selection_wrong_profile', dict(selection_edit=lambda s: dict(s, profile='TEST_ONLY:other.profile')),
         'selection/profile'),
        ('selection_predecessor_rebound', dict(selection_edit=lambda s: dict(s, predecessor=dict(PREDECESSOR, sha256='0' * 64))),
         'selection/predecessor'),
        ('selection_route_restamped', dict(selection_edit=lambda s: dict(s, route_sha256='0' * 64)),
         'selection/route_sha256'),
        ('selection_missing_realm', dict(selection_edit=lambda s: dict(s, realms=s['realms'][:-1])), 'selection/realms'),
        ('method_wrong_profile', dict(method_edit=lambda m: dict(m, profile='TEST_ONLY:other.profile')), 'method/profile'),
        ('method_predecessor_bank', dict(method_edit=lambda m: dict(m, bank=PREDECESSOR['path'])), 'method/bank'),
        ('method_wrong_import', dict(method_edit=lambda m: dict(m, import_ref='TEST_ONLY:original:other')), 'method/import'),
        ('method_implicit_selection', dict(), 'method/selection_handle'),
        ('method_cross_cast', dict(), 'method/name'),
    ], other


def run(output=None):
    out = []
    try:
        detail = positive()
        out.append(dict(id='complete_scoped_routing_qualification', kind='positive', status='pass', detail=detail))
    except Exception as error:  # noqa: BLE001
        out.append(dict(id='complete_scoped_routing_qualification', kind='positive', status='fail',
                        error='%s: %s' % (type(error).__name__, error)))
    rows, _ = cases()
    for name, kwargs, expected in rows:
        try:
            if name == 'method_implicit_selection':
                negative(kwargs, method_override=lambda per, m: dict(method=m, profile=PROFILE))
            elif name == 'method_cross_cast':
                negative(kwargs, method_override=lambda per, m: per['owner.goal_run.cancelled.read_retained_native.v1'])
            else:
                negative(kwargs)
            out.append(dict(id=name, kind='negative', expected=expected, got='ACCEPTED', status='fail'))
        except (A.AdapterRefusal, NR.NumruleRefusal) as error:
            got = A.refusal_code(error)
            out.append(dict(id=name, kind='negative', expected=expected, got=got,
                            status='pass' if got == expected else 'fail'))
        except Exception as error:  # noqa: BLE001
            out.append(dict(id=name, kind='negative', expected=expected, got='%s: %s' % (type(error).__name__, error),
                            status='fail'))
    failures = [c for c in out if c['status'] != 'pass']
    result = dict(qualification=QUALIFICATION, native=NR.NATIVE_LINE, group='R1', family='goal_run.cancelled',
                  positives=sum(c['kind'] == 'positive' for c in out),
                  negatives=sum(c['kind'] == 'negative' for c in out), cases=out,
                  status='pass' if not failures else 'fail', failures=failures)
    if output:
        Path(output).write_text(json.dumps(result, indent=2, sort_keys=True) + '\n')
    return result


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--output')
    a = p.parse_args()
    result = run(a.output)
    print(json.dumps(dict(status=result['status'], positives=result['positives'], negatives=result['negatives'],
                          failures=[(f['id'], f.get('expected'), f.get('got') or f.get('error'))
                                    for f in result['failures']]), indent=1))
    return 0 if result['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
