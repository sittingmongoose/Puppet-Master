"""Whole, isolated original schema banks for DG-OWN-C TEST_ONLY witnesses.

Resource qualification never supplies owner issuance or semantic-path proof.
No numeric identity codec and no guard-removal machinery live here.
"""
from __future__ import annotations

import hashlib
import json

from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
from pm_goal_own_c_oracles import ROOT, Validator, FORMAT, Refusal, require, equal


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def pointer(value, fragment):
    for key in fragment.lstrip('/').split('/') if fragment else ():
        key = key.replace('~1', '/').replace('~0', '~')
        value = value[int(key)] if isinstance(value, list) else value[key]
    return value


class OriginalBank:
    """Pin whole bytes before registering even an embedded original resource."""
    def __init__(self, declaration, locations):
        self.registry = Registry()
        self.documents = {}
        self.raw = {}
        for entry in declaration.get('resources', declaration.get('whole_documents', [])):
            raw = self._whole(entry, locations)
            value = pointer(json.loads(raw), entry.get('json_pointer', '').lstrip('#'))
            uri = entry['retrieval_uri']
            self._register(uri, value)
        for entry in declaration.get('embedded_resources', []):
            raw = self._whole(entry, locations)
            value = pointer(json.loads(raw), entry['json_pointer'].lstrip('#'))
            self._register(entry['retrieval_uri'], value)
        self.registry = self.registry.crawl()
        for uri, value in self.documents.items():
            self._refs(value, self.registry.resolver(uri))

    def _whole(self, entry, locations):
        expected = entry.get('sha256', entry.get('complete_document_sha256'))
        key = entry['path'] + '@' + expected
        path = locations.get(key, entry['path'])
        raw = (ROOT / path).read_bytes()
        require('roots/whole_resource_hash/' + entry['path'], digest(raw) == expected)
        self.raw[path] = raw
        return raw

    def _register(self, uri, value):
        if uri in self.documents:
            require('roots/no_uri_rebinding', equal(self.documents[uri], value))
        self.documents[uri] = value
        self.registry = self.registry.with_resource(uri, Resource.from_contents(value, default_specification=DRAFT202012))

    def _refs(self, node, resolver):
        if isinstance(node, dict):
            if '$id' in node:
                resolver = resolver.in_subresource(Resource.from_contents(node, default_specification=DRAFT202012))
            if '$ref' in node:
                try:
                    resolver.lookup(node['$ref'])
                except Exception as error:
                    raise Refusal('roots/unresolved_reference') from error
            for key in ('$defs', 'definitions', 'properties', 'patternProperties', 'dependentSchemas'):
                for value in node.get(key, {}).values():
                    self._refs(value, resolver)
            for key in ('allOf', 'anyOf', 'oneOf', 'prefixItems'):
                for value in node.get(key, []):
                    self._refs(value, resolver)
            for key in ('items', 'contains', 'if', 'then', 'else', 'not', 'additionalProperties', 'unevaluatedProperties', 'propertyNames'):
                if isinstance(node.get(key), (dict, list)):
                    self._refs(node[key], resolver)
        elif isinstance(node, list):
            for value in node:
                self._refs(value, resolver)

    def errors(self, ref, value):
        return list(Validator({'$ref': ref}, registry=self.registry, format_checker=FORMAT).iter_errors(value))

    def validate(self, ref, value):
        errors = self.errors(ref, value)
        if errors:
            error = errors[0]
            raise Refusal('roots/schema/' + ref.split('#')[-1] + '/' + '/'.join(map(str, error.absolute_path)) + '/' + error.validator)
