"""Whole, isolated original schema banks for DG-OWN-C TEST_ONLY witnesses.

Resource qualification never supplies owner issuance or semantic-path proof.
No numeric identity codec and no guard-removal machinery live here.
"""
from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from functools import lru_cache
from types import MappingProxyType

import jsonschema
import pm_goal_test_numrule as NR

from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
from pm_goal_own_c_oracles import ROOT, Validator, FORMAT, Refusal, require, equal
from pm_goal_oracle_common import timestamp_roles


@dataclass(frozen=True)
class _OwnerFormats:
    checkers: object

    def check(self, value, format):
        return jsonschema.FormatChecker.check(self, value, format)

    def conforms(self, value, format):
        return jsonschema.FormatChecker.conforms(self, value, format)


@lru_cache(maxsize=None)
def _owner_formats(profile):
    # Keep this bank's exact format inventory and UUID predicate. Only the
    # date-time entry changes; the provider's separate utc()/instant() stays.
    checkers = dict(FORMAT.checkers)
    checkers['date-time'] = NR.DT.format_checker(profile=profile).checkers['date-time']
    return _OwnerFormats(MappingProxyType(checkers))


def _timestamp_profiles(schema):
    profiles = timestamp_roles(schema)
    properties = schema.get('properties', {})
    required = set(schema.get('required', ()))
    identity = properties.get('schema_id', {}).get('const')
    if {'observed_at_utc', 'persisted_at_utc', 'sequence_id'} <= required:
        profiles.update({name: NR.DT.STORAGE_UTC_Z for name in ('observed_at_utc', 'persisted_at_utc')
                         if name in properties})
    if identity == 'pm.goal.update.approval_request.v1':
        profiles.update({name: NR.DT.COORDINATION_UTC_Z for name in ('created_at_utc', 'expires_at_utc')
                         if name in properties})
    if {'approval_id', 'request_sha256', 'decided_at_utc', 'protected_person_decision_ref'} <= required:
        if 'decided_at_utc' in properties:
            profiles['decided_at_utc'] = NR.DT.COORDINATION_UTC_Z
    return profiles


def _has_field_error(errors, name, keyword):
    for error in errors:
        if ((list(error.path) == [name] or list(error.absolute_path) == [name]) and error.validator == keyword
                and (keyword != 'format' or error.validator_value == 'date-time')):
            return True
        if _has_field_error(error.context, name, keyword):
            return True
    return False


def _owned_properties(validator, properties, instance, schema):
    if not validator.is_type(instance, 'object'):
        return
    profiles = _timestamp_profiles(schema)
    for name, subschema in properties.items():
        if name not in instance:
            continue
        profile = profiles.get(name, NR.DT.EVENT_RECORD)
        checker = _owner_formats(profile)
        child = validator if validator.format_checker is checker else validator.evolve(format_checker=checker)
        errors = list(child.descend(instance[name], subschema, path=name, schema_path=name))
        # Owner clocks remain enforced when a pinned schema omits its format.
        # Reuse a reached type/format error so its shape and ordering survive.
        if name in profiles and not (name == 'expires_at_utc' and instance[name] is None):
            try:
                NR.DT.date_time(instance[name], profile=profile)
            except NR.NumRefusal as error:
                keyword = 'format' if validator.is_type(instance[name], 'string') else 'type'
                if not _has_field_error(errors, name, keyword):
                    value = 'date-time' if keyword == 'format' else 'string'
                    yield jsonschema.ValidationError(
                        f'{instance[name]!r} is not a {value!r}', validator=keyword,
                        validator_value=value, instance=instance[name], schema=subschema,
                        path=(name,), schema_path=(name, keyword), cause=error)
        yield from errors


@lru_cache(maxsize=None)
def _original_validator(base):
    # Preserve the selected dialect's existing keyword implementations,
    # including its pattern route. Only the owner profile hook is added.
    from attrs import fields
    cls = jsonschema.validators.extend(base, {'properties': _owned_properties})

    def evolve(self, **changes):
        schema = changes.setdefault('schema', self.schema)
        selected = jsonschema.validators.validator_for(schema, default=base)
        for field in fields(type(self)):
            if field.init and field.alias not in changes:
                changes[field.alias] = getattr(self, field.name)
        return _original_validator(selected)(**changes)

    cls.evolve = evolve
    return cls


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
        self.resource_origins = {}
        self.raw = {}
        for entry in declaration.get('resources', declaration.get('whole_documents', [])):
            raw = self._whole(entry, locations)
            value = pointer(json.loads(raw), entry.get('json_pointer', '').lstrip('#'))
            uri = entry['retrieval_uri']
            self._register(uri, value, (digest(raw),entry.get('json_pointer','').lstrip('#')))
        for entry in declaration.get('embedded_resources', []):
            raw = self._whole(entry, locations)
            value = pointer(json.loads(raw), entry['json_pointer'].lstrip('#'))
            self._register(entry['retrieval_uri'], value, (digest(raw),entry['json_pointer'].lstrip('#')))
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

    def _register(self, uri, value, origin):
        if uri in self.documents:
            require('roots/no_uri_rebinding', self.resource_origins[uri] == origin)
        self.documents[uri] = value
        self.resource_origins[uri] = origin
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

    def validator(self, ref):
        """The exact bank validator, exposed for clause-closure callers."""
        return _original_validator(Validator)({'$ref': ref}, registry=self.registry,
                                             format_checker=_owner_formats(NR.DT.EVENT_RECORD))

    def errors(self, ref, value):
        return list(self.validator(ref).iter_errors(value))

    def validate(self, ref, value):
        errors = self.errors(ref, value)
        if errors:
            error = errors[0]
            raise Refusal('roots/schema/' + ref.split('#')[-1] + '/' + '/'.join(map(str, error.absolute_path)) + '/' + error.validator)
