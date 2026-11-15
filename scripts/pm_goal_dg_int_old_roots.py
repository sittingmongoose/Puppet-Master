#!/usr/bin/env python3
"""Explicit original-profile C3 companion selection (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Original-profile and native-v7 resources retain separate complete banks. New
literal companion URIs make the canonical C3 Goal boundary explicit; no v7
translation applies to original-profile native/D01 values.
"""
import hashlib,json
from referencing import Registry,Resource
from referencing.jsonschema import DRAFT202012
import pm_goal_dg_r_world as W
import pm_goal_dg_int_roots as IR


class Roots(IR.Roots):
    _instance=None

    def __init__(self):
        super().__init__()
        selection=json.loads((W.ROOT/'Plans/goal_own_c_contracts/dg-int-original-c3-v1/resources.json').read_text())
        self.original_selection=selection
        self.uri_map=dict(selection['uri_map'])
        self.priority=['integration_original','cancelled_native_consumer','cancelled_goal_consumer',
            'cancelled_filesafe_consumer','retained_original_d05','native','consumer','companions']
        docs={}
        for row in selection['resources']:
            raw=(W.ROOT/row['path']).read_bytes()
            W.guard('int/old/whole_hash',hashlib.sha256(raw).hexdigest()==row['sha256'])
            W.guard('int/old/predecessor_hash',hashlib.sha256((W.ROOT/row['predecessor_path']).read_bytes()).hexdigest()==row['predecessor_sha256'])
            doc=json.loads(raw)
            W.guard('int/old/new_literal_id',doc['$id']==row['retrieval_uri'] and doc['$id']!=row['predecessor_uri'])
            docs[row['retrieval_uri']]=doc
            self._index('integration_original',row['sha256'],doc,'')
            self.realm_of_uri[row['retrieval_uri']]=['integration_original']
        self.documents['integration_original']=docs
        self.registries['integration_original']=Registry().with_resources(
            (u,Resource.from_contents(doc,default_specification=DRAFT202012)) for u,doc in docs.items()).crawl()
        for row in selection['imports']:
            key=(row['from_realm'],row['from_whole_sha256'],row['from_schema_location'],row['literal_reference'])
            W.guard('int/old/unique_import',key not in self.routes)
            self.routes[key]=(row['to_realm'],row['to_retrieval_uri'])
