"""Explicit location-scoped W12 successor imports; original resources unchanged.

The native WorkNode source's eleven literal references resolve in its retained
original handoff realm. Neither schemas nor instance values are rewritten.
Nested lookup stays in that retained realm. No global registry merge/fallback.
"""
from __future__ import annotations
import json
from urllib.parse import urldefrag, urljoin
from referencing import Resource
from referencing.jsonschema import DRAFT202012
from pm_goal_own_c_roots import OriginalBank, digest
from pm_goal_own_c_oracles import ROOT, Validator, FORMAT, Refusal, require


class ScopedResolverV2:
    def __init__(self,resolver,bank,origin=None,retained=False):
        self.resolver,self.bank,self.origin,self.retained=resolver,bank,origin,retained

    def __getattr__(self,name):
        return getattr(self.resolver,name)

    def in_subresource(self,resource):
        return ScopedResolverV2(self.resolver.in_subresource(resource),self.bank,
            self.bank.node_origins.get(id(resource.contents)),self.retained)

    def lookup(self,ref):
        key=None if self.origin is None else (*self.origin,urljoin(self.resolver._base_uri,ref))
        route=None if self.retained else self.bank.imports.get(key)
        if route is not None:
            require('routing/literal_reference',ref==route['literal_ref'])
            require('routing/original_uri',urljoin(self.resolver._base_uri,ref)==route['target_ref'])
            hit=self.bank.retained.registry.resolver().lookup(route['target_ref'])
            resolver=ScopedResolverV2(hit.resolver,self.bank,retained=True)
        else:
            hit=self.resolver.lookup(ref)
            resolver=ScopedResolverV2(hit.resolver,self.bank,
                self.bank.node_origins.get(id(hit.contents)),self.retained)
        return type(hit)(contents=hit.contents,resolver=resolver)


class ScopedBankV2(OriginalBank):
    def __init__(self, declaration, locations, imports, retained):
        self.node_origins={}
        self.imports={(r['source_document_sha256'],r['source_pointer'],r['target_ref']):r for r in imports}
        self.matched_imports=set()
        require('routing/unique_locations',len(self.imports)==len(imports))
        self.retained=retained
        for route in imports:
            target=urldefrag(route['target_ref'])[0]
            require('routing/target_whole_hash', retained.resource_origins[target][0]==route['whole_target_sha256'])
            require('routing/fragment',urldefrag(route['target_ref'])[1]==urldefrag(route['literal_ref'])[1])
            require('routing/original_uri',urljoin(route['source_base_uri'],route['literal_ref'])==route['target_ref'])
        super().__init__(declaration,locations)
        require('routing/declared_locations',set(self.imports)==self.matched_imports)

    def _register(self,uri,value,origin):
        super()._register(uri,value,origin)
        def record(node,pointer):
            if isinstance(node,dict):
                self.node_origins[id(node)]=(origin[0],pointer)
                for key,child in node.items():
                    record(child,pointer+'/'+key.replace('~','~0').replace('/','~1'))
            elif isinstance(node,list):
                for i,child in enumerate(node):record(child,pointer+'/'+str(i))
        record(value,origin[1])

    def route(self,node,ref,resolver):
        origin=self.node_origins.get(id(node))
        key=None if origin is None else (*origin,urljoin(resolver._base_uri,ref))
        route=self.imports.get(key)
        if route is not None:
            require('routing/literal_reference',ref==route['literal_ref'])
            self.matched_imports.add(key)
        return route

    def _refs(self,node,resolver):
        if isinstance(node,dict):
            if '$id' in node:
                resolver=resolver.in_subresource(Resource.from_contents(node,default_specification=DRAFT202012))
            if '$ref' in node:
                route=self.route(node,node['$ref'],resolver)
                try:
                    if route is None:resolver.lookup(node['$ref'])
                    else:
                        require('routing/original_uri',urljoin(resolver._base_uri,node['$ref'])==route['target_ref'])
                        self.retained.registry.resolver().lookup(route['target_ref'])
                except Exception as error:raise Refusal('roots/unresolved_reference') from error
            for child in node.values():
                if isinstance(child,(dict,list)):self._refs(child,resolver)
        elif isinstance(node,list):
            for child in node:self._refs(child,resolver)

    def errors(self,ref,value):
        resolver=ScopedResolverV2(self.registry.resolver(),self)
        return list(Validator({'$ref':ref},registry=self.registry,format_checker=FORMAT,
                              _resolver=resolver).iter_errors(value))


def selected_bank(declaration,locations,selection,method_selection):
    scope=method_selection.get('scoped_imports')
    if scope is None or selection['path']!=scope['source_bank'] or selection['realm']!=scope['source_realm']:
        return OriginalBank(declaration,locations)
    raw=(ROOT/scope['path']).read_bytes()
    require('selection/imports_hash',digest(raw)==scope['sha256'])
    rules=json.loads(raw)
    retained_raw=(ROOT/rules['retained_bank']['path']).read_bytes()
    require('selection/retained_bank_hash',digest(retained_raw)==rules['retained_bank']['sha256'])
    retained=OriginalBank(json.loads(retained_raw),locations)
    return ScopedBankV2(declaration,locations,rules['imports'],retained)
