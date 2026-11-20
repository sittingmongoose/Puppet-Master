"""W4's explicit successor routing; whole predecessor resources stay unchanged.

No schema specimen authenticates an original. This module qualifies schema
closure only. Its one cross-realm edge is checked by whole source hash, literal
reference, schema location and absolute target; nested lookups use the retained
realm's own registry. No filesystem/network retrieval or bank merge occurs.
"""
from __future__ import annotations

import copy
import hashlib
import json
from urllib.parse import urldefrag, urljoin

from referencing import Registry, Resource
from referencing.exceptions import Unresolvable
from referencing.jsonschema import DRAFT202012

from pm_goal_own_c_oracles import ROOT, Refusal, require, equal
from pm_goal_own_c3_w34_oracles import children

DIRECTORY = ROOT / 'Plans/goal_run_cancelled_w4_contracts'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def load(path):
    return json.loads((ROOT / path).read_text())


def pinned(pin):
    raw = (ROOT / pin['path']).read_bytes()
    require('w4/whole_hash/' + pin['path'], sha(raw) == pin['sha256'])
    return json.loads(raw)


def pointer(value, location):
    for key in location.lstrip('#').split('/')[1:] if location.lstrip('#') else ():
        key = key.replace('~1', '/').replace('~0', '~')
        value = value[int(key)] if isinstance(value, list) else value[key]
    return value


def check_binding(previous, proposed):
    """Independent registration component; paths may relocate exact bytes.

    The loader has already verified the complete proposed bytes. Identity here
    is whole-document hash plus selected pointer, never parsed-value equality.
    """
    if previous is not None:
        require('w4/no_rebinding/hash', previous[1] == proposed[1])
        require('w4/no_rebinding/pointer', previous[2] == proposed[2])


class W4Roots:
    def __init__(self, selection=None, routing=None, eager=True):
        self.selection = copy.deepcopy(selection or load(str(DIRECTORY / 'selection.v1.json')))
        selected_route = pinned(self.selection['routing'])
        self.route = copy.deepcopy(selected_route if routing is None else routing)
        maps = [pinned(pin)['methods'] for pin in self.selection['method_maps']]
        # The complete original maps supply the signatures. The selected
        # retained-native/inspection entries are not widened to old projection
        # methods; the four reference methods come from their separate map.
        self.method_definitions = {m['method']: m for m in maps[0][:2] + maps[1]}
        # An externally supplied route is useful only for isolated negative
        # probes. It must still satisfy the complete selected route commitment.
        require('w4/route_commitment', equal(self.route, selected_route))
        require('w4/no_network', self.route['network_fallback'] is False)
        require('w4/no_merge', self.route['whole_bank_merge'] is False)
        require('w4/predecessor_selection', self.route['predecessor'] == self.selection['predecessor'])
        original = pinned(self.selection['predecessor'])
        retained = pinned(self.route['target_realm_selection']['manifest'])
        declarations = dict(original['realms'])
        target_realm = self.route['target_realm']
        require('w4/retained_realm_selection', self.route['target_realm_selection']['realm'] == target_realm)
        declarations[target_realm] = retained[target_realm]
        locations = pinned(self.selection['whole_resource_locations'])
        projection = pinned(self.selection['projection_resources'])
        require('w4/projection_predecessor', projection['original_bank_sha256'] == self.selection['predecessor']['sha256'])
        physical = pinned(self.selection['projection_selection'])
        # The protocol is prose, so verify its bytes without interpreting it as
        # JSON. The selected K recipe remains SP-312's original base64url rule.
        protocol = self.selection['projection_protocol']
        require('w4/whole_hash/' + protocol['path'], sha((ROOT / protocol['path']).read_bytes()) == protocol['sha256'])
        require('w4/projection_resource_selection', projection['successor_resource'] == physical['new_whole_schema'])
        declarations = copy.deepcopy(declarations)
        declarations[projection['realm']]['resources'].append(projection['successor_resource'])
        self.registries, self.documents, self.origins, self.node_origins = {}, {}, {}, {}
        self.edges = []
        for realm, declaration in declarations.items():
            documents, origins = {}, {}
            for entry in declaration['resources']:
                path = locations.get(entry['path'] + '@' + entry['sha256'], entry['path'])
                raw = (ROOT / path).read_bytes()
                require('w4/resource_hash/' + entry['path'], sha(raw) == entry['sha256'])
                document = pointer(json.loads(raw), entry.get('json_pointer', ''))
                uri = entry['retrieval_uri']
                origin = (entry['path'], entry['sha256'], entry.get('json_pointer', ''))
                # A relocated exact whole file is still the same resource;
                # byte hash and selected pointer, rather than local path, bind it.
                check_binding(origins.get(uri), origin)
                documents[uri], origins[uri] = document, origin
                self._index_nodes(realm, document, origin, '')
            self.documents[realm], self.origins[realm] = documents, origins
            self.registries[realm] = Registry().with_resources(
                (uri, Resource.from_contents(value, default_specification=DRAFT202012))
                for uri, value in documents.items()).crawl()
        self.allowed_sites = {r['schema_location']: r['literal_reference'] for r in self.route['sites']}
        source = pinned(self.route['source_whole'])
        require('w4/route_source_aliases', self.route['source_retrieval_aliases'] == [
            r['retrieval_uri'] for r in original['realms'][self.route['source_realm']]['resources']
            if r['path'] == self.route['source_whole']['path'] and all(
                urldefrag(urljoin(urljoin(r['retrieval_uri'], source.get('$id', '')), site['literal_reference']))[0]
                == self.route['absolute_target_uri'] for site in self.route['sites'])])
        for site, literal in self.allowed_sites.items():
            require('w4/route_literal', pointer(source, site) == literal)
        target = self.route['absolute_target_uri']
        origin = self.origins[target_realm].get(target)
        require('w4/target_binding', origin is not None and origin[:2] == (
            self.route['target_whole']['path'], self.route['target_whole']['sha256']) and origin[2] == '')
        pinned(self.route['target_whole'])
        self.audit_rows = self.audit() if eager else []

    def _index_nodes(self, realm, node, origin, path):
        if isinstance(node, dict):
            self.node_origins[realm, id(node)] = (*origin, path)
            for key, value in node.items():
                self._index_nodes(realm, value, origin, path + '/' + key.replace('~', '~0').replace('/', '~1'))
        elif isinstance(node, list):
            for index, value in enumerate(node):
                self._index_nodes(realm, value, origin, path + '/' + str(index))

    def lookup(self, realm, resolver, reference, schema=None):
        absolute = urljoin(resolver._base_uri, reference)
        base = urldefrag(absolute)[0]
        if base == self.route['absolute_target_uri'] and realm == self.route['source_realm']:
            origin = self.node_origins.get((realm, id(schema)))
            require('w4/route_source', origin is not None and origin[:2] == (
                self.route['source_whole']['path'], self.route['source_whole']['sha256']))
            require('w4/route_location', origin[3] + '/$ref' in self.allowed_sites)
            require('w4/route_reference', self.allowed_sites[origin[3] + '/$ref'] == reference)
            destination = self.route['target_realm']
            return destination, self.registries[destination].resolver().lookup(absolute)
        return realm, resolver.lookup(reference)

    def audit(self):
        rows = []
        for realm, documents in self.documents.items():
            counts = dict(reference_sites=0, cross_realm_sites=0)
            def walk(node, resolver):
                if not isinstance(node, dict):
                    return
                for keyword in ('$dynamicRef', '$recursiveRef', '$dynamicAnchor', '$recursiveAnchor'):
                    require('w4/no_unsupported_dynamic_reference', keyword not in node)
                if '$id' in node:
                    resolver = resolver.in_subresource(Resource.from_contents(node, default_specification=DRAFT202012))
                if '$ref' in node:
                    counts['reference_sites'] += 1
                    try:
                        destination, result = self.lookup(realm, resolver, node['$ref'], node)
                    except Unresolvable as error:
                        raise Refusal('w4/unresolved_reference') from error
                    if destination != realm:
                        counts['cross_realm_sites'] += 1
                        origin = self.node_origins[realm, id(node)]
                        self.edges.append(dict(realm=realm, source_retrieval_uri=uri, source_path=origin[0], source_sha256=origin[1],
                            schema_location=origin[3] + '/$ref', literal_reference=node['$ref'],
                            target_realm=destination, target_base=result.resolver._base_uri))
                for _, child in children(node):
                    walk(child, resolver)
            for uri, document in documents.items():
                walk(document, self.registries[realm].resolver(uri))
            rows.append(dict(realm=realm, whole_resources=len(documents), **counts, unresolved=0))
        return rows

    def resolve(self, realm, reference):
        return self.lookup(realm, self.registries[realm].resolver(), reference)
