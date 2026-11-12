#!/usr/bin/env python3
"""Explicit additive DG-INT C3/native-v7 resource realm (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Frozen predecessor registries are shared unchanged. New whole resources have
new literal URIs and individually pinned, location-scoped imports. No schema
is extracted, rebound under an original URI, or fetched from the network.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
from urllib.parse import urldefrag,urljoin
import jsonschema
from referencing import Registry,Resource
from referencing.jsonschema import DRAFT202012
import pm_goal_dg_r_world as W

QUALIFICATION='TEST_ONLY'
NATIVE_LINE=W.NATIVE_LINE
SELECTION='Plans/goal_own_c_contracts/dg-int-native-v7-v1/resources.json'


class Roots(W.RootsV7):
    _instance=None
    def __init__(self):
        base=W.RootsV7.get()
        self.package=base.package
        self.documents=dict(base.documents)
        self.registries=dict(base.registries)
        self.node_origin=dict(base.node_origin)
        self.realm_of_uri={k:list(v) for k,v in base.realm_of_uri.items()}
        self.routes=dict(base.routes)
        self.inherited=dict(base.inherited)
        self.priority=['integration_native']+base.priority
        self._validators={}
        selection=json.loads((W.ROOT/SELECTION).read_text())
        self.selection=selection
        remap=selection['uri_map']
        self.uri_map={k:remap.get(v,v) for k,v in base.uri_map.items()}
        self.uri_map.update(remap)
        docs={}
        for row in selection['resources']:
            raw=(W.ROOT/row['path']).read_bytes()
            W.guard('int/realm/whole_hash',hashlib.sha256(raw).hexdigest()==row['sha256'])
            old=(W.ROOT/row['predecessor_path']).read_bytes()
            W.guard('int/realm/predecessor_hash',hashlib.sha256(old).hexdigest()==row['predecessor_sha256'])
            doc=json.loads(raw)
            W.guard('int/realm/new_literal_id',doc['$id']==row['retrieval_uri'] and doc['$id']!=row['predecessor_uri'])
            docs[row['retrieval_uri']]=doc
            self._index('integration_native',row['sha256'],doc,'')
            self.realm_of_uri[row['retrieval_uri']]=['integration_native']
        self.documents['integration_native']=docs
        self.registries['integration_native']=Registry().with_resources(
            (u,Resource.from_contents(doc,default_specification=DRAFT202012)) for u,doc in docs.items()).crawl()
        for row in selection['imports']:
            key=(row['from_realm'],row['from_whole_sha256'],row['from_schema_location'],row['literal_reference'])
            W.guard('int/realm/unique_import',key not in self.routes)
            self.routes[key]=(row['to_realm'],row['to_retrieval_uri'])
        roots=self
        def routed_ref(validator,ref,instance,schema):
            resolver=validator._resolver
            absolute=urldefrag(urljoin(resolver._base_uri,ref))[0]
            if absolute in resolver._registry or not absolute:
                yield from validator._validate_reference(ref=ref,instance=instance)
                return
            origin=roots.node_origin.get(id(schema))
            W.guard('int/realm/import_origin',origin is not None)
            realm,whole,location=origin
            target=roots.routes.get((realm,whole,location+'/$ref',ref)) or roots.inherited.get((realm,absolute))
            W.guard('int/realm/import_unlisted',target is not None)
            to_realm,to_uri=target
            fragment=urldefrag(urljoin(resolver._base_uri,ref))[1]
            resolved=roots.registries[to_realm].resolver(to_uri).lookup(to_uri+('#'+fragment if fragment else ''))
            yield from validator.descend(instance,resolved.contents,resolver=resolved.resolver)
        self.validator_class=jsonschema.validators.extend(W.Validator,{'$ref':routed_ref})
