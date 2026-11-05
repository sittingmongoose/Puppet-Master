#!/usr/bin/env python3
"""Prove DG6B guards through complete family calls, one family at a time.

Every mutant calls Probe.call again. Schema removals edit exact keywords in
otherwise unchanged definitions; no captured instance is validated separately.
A surviving target, an unrelated flip, a different refusal, a missing positive,
or an unclassified second guard fails the proof. No production guard changes.
"""
import argparse
import ast
import copy
import hashlib
import json
import re
from functools import cache
from pathlib import Path

from jsonschema import Draft202012Validator as MetaValidator
from pm_dg6b_full_oracles import family_probes, changes

ROOT = Path(__file__).resolve().parents[1]
CHECKER = ROOT / 'scripts/pm-dg6b-event-contracts.py'


def reason(node):
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'ValueError':
        arg = node.args[0]
        if isinstance(arg, ast.Constant): return arg.value
        if isinstance(arg, ast.BinOp) and isinstance(arg.left, ast.Constant): return arg.left.value.rstrip(': ')


def guard_name(error):
    return 'current_writer_policy' if error in ('replay_only_not_appendable','writer_replay_policy') else error


def guard_inventory(source):
    result={}
    for fn in ast.parse(source).body:
        if not isinstance(fn,ast.FunctionDef): continue
        for node in ast.walk(fn):
            if isinstance(node,ast.Raise) and reason(node.exc):
                result.setdefault(guard_name(reason(node.exc)),[]).append({'function':fn.name,'line':node.lineno})
    return result


def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()


@cache
def checked_schema(serialized):
    return MetaValidator.check_schema(json.loads(serialized))


def expand_refs(node, resolver):
    if isinstance(node,dict):
        if '$ref' in node:
            resolved=resolver.lookup(node['$ref'])
            return {**expand_refs(resolved.contents,resolved.resolver),
                    **expand_refs({k:v for k,v in node.items() if k!='$ref'},resolver)}
        return {k:expand_refs(v,resolver) for k,v in node.items()}
    if isinstance(node,list): return [expand_refs(v,resolver) for v in node]
    return node


def leaves(error,value):
    if error.validator=='oneOf' and error.context:
        branch=1 if isinstance(value,dict) and 'payload_ref' in value else 0
        return [e for child in error.context if list(child.schema_path)[0]==branch for e in leaves(child,value)]
    if error.validator=='anyOf' and error.context:
        if all(child.validator == 'type' for child in error.context):
            # The alternatives together are one allowed-type predicate, not
            # duplicate enforcement sites. Keep branch value constraints.
            return [error]
        return [e for child in error.context for e in leaves(child,value)]
    return [error]


APP_KEY = r'application@1:(?:[0-9a-f]{2})+:(?:[0-9a-f]{2})+'


def predicate_clauses(node):
    """Distribute compound refusals, retaining each clause's applicability.

    A boolean grant's type and truth value are separate predicates. Removing
    the type clause still refuses the opposite, well-typed boolean.
    """
    code = ast.unparse(node)
    if code == "e.get('replay_policy') != 'dedupe_by_idempotency_key'":
        return [[ast.parse(text, mode='eval').body] for text in (
            "e.get('replay_policy') == 'projector_replay_only'",
            "e.get('replay_policy') not in ('dedupe_by_idempotency_key', 'projector_replay_only')")]
    if code == "e['idempotency_key'] != idem":
        # Exact reconstructed equality entails key grammar, but malformed key
        # syntax and a well-formed foreign key are independent predicates.
        return [[ast.parse(text, mode='eval').body] for text in (
            "e['idempotency_key'] != idem and not _dg6b_general_key(e['idempotency_key'], name)",
            "e['idempotency_key'] != idem and _dg6b_general_key(e['idempotency_key'], name) and not _dg6b_key_syntax(e['idempotency_key'], name, scope)",
            "e['idempotency_key'] != idem and _dg6b_key_syntax(e['idempotency_key'], name, scope)")]
    if code == 'None in source_fields':
        return [[ast.parse(f"p[{key!r}] is None", mode='eval').body]
                for key in ('source_id','source_revision','source_sha256')]
    if isinstance(node, ast.BoolOp):
        parts = [predicate_clauses(v) for v in node.values]
        if isinstance(node.op, ast.Or):
            return [c for part in parts for c in part]
        result = [[]]
        for part in parts:
            result = [a + b for a in result for b in part]
        return result
    if (isinstance(node, ast.Compare) and len(node.ops) == 1
            and isinstance(node.ops[0], ast.IsNot)
            and isinstance(node.comparators[0], ast.Constant)
            and type(node.comparators[0].value) is bool):
        operand = ast.unparse(node.left)
        opposite = ast.unparse(node)
        return [[ast.parse(f'type({operand}) is not bool', mode='eval').body],
                [ast.parse(f'type({operand}) is bool and ({opposite})', mode='eval').body]]
    if (isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
            and node.func.id == 'any' and len(node.args) == 1
            and isinstance(node.args[0], ast.GeneratorExp)):
        gen = node.args[0]
        if (len(gen.generators) == 1 and not gen.generators[0].ifs
                and isinstance(gen.generators[0].iter, (ast.Tuple, ast.List))):
            target = gen.generators[0].target
            if isinstance(target, ast.Name):
                class Substitute(ast.NodeTransformer):
                    def __init__(self, value): self.value = value
                    def visit_Name(self, item):
                        return copy.deepcopy(self.value) if item.id == target.id else item
                return [c for value in gen.generators[0].iter.elts
                        for c in predicate_clauses(Substitute(value).visit(copy.deepcopy(gen.elt)))]
    if (isinstance(node, ast.Compare) and len(node.ops) == 1
            and isinstance(node.ops[0], ast.NotEq) and isinstance(node.left, ast.Tuple)
            and isinstance(node.comparators[0], ast.Tuple)):
        return [[ast.Compare(left=a, ops=[ast.NotEq()], comparators=[b])]
                for a, b in zip(node.left.elts, node.comparators[0].elts)]
    return [[node]]


@cache
def compiled_module(source, runtime=()):
    class Cut(ast.NodeTransformer):
        function = None
        def visit_FunctionDef(self, node):
            previous, self.function = self.function, node.name
            result = self.generic_visit(node)
            self.function = previous
            return result
        def visit_If(self, node):
            if (len(node.body) != 1 or not isinstance(node.body[0], ast.Raise)
                    or not reason(node.body[0].exc)):
                return self.generic_visit(node)
            site = f"{guard_name(reason(node.body[0].exc))}@{self.function}:{node.body[0].lineno}"
            tests = []
            for clause in predicate_clauses(node.test):
                expression = clause[0] if len(clause) == 1 else ast.BoolOp(op=ast.And(), values=clause)
                code = ast.unparse(ast.fix_missing_locations(expression))
                names = sorted({n.id for n in ast.walk(expression) if isinstance(n, ast.Name)} &
                               {'key', 'field', 'payload_key', 'result_key'})
                bindings = ast.Dict(keys=[ast.Constant(n) for n in names],
                                    values=[ast.Name(id=n, ctx=ast.Load()) for n in names])
                # Whole-object custody joins are cut at the mismatching leaf,
                # never by disabling the comparison for every field at once.
                if (isinstance(expression, ast.UnaryOp) and isinstance(expression.op, ast.Not)
                        and isinstance(expression.operand, ast.Call)
                        and isinstance(expression.operand.func, ast.Name)
                        and expression.operand.func.id == 'same_value'):
                    test = ast.Call(func=ast.Name(id='_dg6b_unequal', ctx=ast.Load()),
                        args=[ast.Constant(site + '/' + code), *expression.operand.args, bindings], keywords=[])
                else:
                    thunk = ast.Lambda(args=ast.arguments(posonlyargs=[], args=[], kwonlyargs=[],
                        kw_defaults=[], defaults=[]), body=expression)
                    test = ast.Call(func=ast.Name(id='_dg6b_predicate', ctx=ast.Load()),
                        args=[ast.Constant(site + '/' + code), thunk, bindings], keywords=[])
                tests.append(test)
            node.test = tests[0] if len(tests) == 1 else ast.BoolOp(op=ast.Or(), values=tests)
            return node
    tree = Cut().visit(ast.parse(source)); ast.fix_missing_locations(tree)
    return compile(tree, str(CHECKER), 'exec')


EXPANDED = {}
PURE_HELPERS = {}

def module_for(source, runtime=(), keywords=(), capture=None):
    m={'__file__':str(CHECKER),'__name__':'dg6b_full_guard_mutant'}
    trace = []
    def bound(site, bindings):
        import sys
        frame = sys._getframe(1)
        while frame:
            if frame.f_code.co_filename == str(CHECKER) and frame.f_code.co_name in (
                    'operation_contract', 'resolution_storage_contract', 'record_contract'):
                site += '/via=' + frame.f_code.co_name
                break
            frame = frame.f_back
        return site + (('/' + json.dumps(bindings, sort_keys=True)) if bindings else '')
    def predicate(site, thunk, bindings):
        key = bound(site, bindings)
        if key in runtime: return False
        value = thunk()
        if value: trace.append(key)
        return value
    def unequal(site, left, right, bindings):
        if m['same_value'](left, right): return False
        paths = changes(left, right)
        # A codec refusal without a structural mismatch is not removable here.
        if not paths: return True
        for path in paths:
            key = bound(site, bindings) + '/field=' + json.dumps(path, separators=(',', ':'))
            if key not in runtime:
                trace.append(key)
                return True
        return False
    def general_key(key, name):
        return type(key) is str and re.fullmatch(APP_KEY + '|' + re.escape(name) + r':[0-9a-f]{64}', key) is not None
    def key_syntax(key, name, scope):
        pattern = APP_KEY if scope['scope_kind'] == 'application' else re.escape(name) + r':[0-9a-f]{64}'
        return type(key) is str and re.fullmatch(pattern, key) is not None
    m.update(_dg6b_predicate=predicate, _dg6b_unequal=unequal, _dg6b_trace=trace,
             _dg6b_key_syntax=key_syntax, _dg6b_general_key=general_key)
    exec(compiled_module(source),m)
    # Cache immutable schema construction and file parsing only. Every call
    # still runs instance validation, joins, byte encoding and all semantics.
    for name in ('load_plan','payload_type_definition','workflow_scope_schema','durable_token_schema','persona_io_definition'):
        if name not in PURE_HELPERS: PURE_HELPERS[name]=m[name]
        else: m[name]=PURE_HELPERS[name]
    actual=m['Draft202012Validator']
    schema_keys={}; patched_schemas={}
    class Validator:
        def __new__(cls,definition,*args,**kwargs):
            # All schemas still execute at their original production callsite.
            import sys
            frame=sys._getframe(1)
            while frame.f_code.co_filename != str(CHECKER) or frame.f_code.co_name == '<lambda>': frame=frame.f_back
            role=frame.f_code.co_name
            identity=id(definition)
            if identity not in schema_keys:
                schema_keys[identity]=(definition,json.dumps(definition,sort_keys=True,separators=(',',':')))
            assert schema_keys[identity][0] is definition
            key=schema_keys[identity][1]
            if key not in EXPANDED:
                from referencing import Registry, Resource
                from referencing.jsonschema import DRAFT202012
                registry=kwargs.get('registry',Registry())
                resolver=registry.resolver_with_root(Resource.from_contents(definition,default_specification=DRAFT202012))
                expanded=expand_refs(definition,resolver)
                EXPANDED[key]=(expanded,digest(expanded))
            expanded,resource=EXPANDED[key]
            selected=[k for k in keywords if k['role']==role and k['schema_sha256']==resource]
            patched=expanded
            patch_key=(role,resource)
            if patch_key in patched_schemas:
                patched=patched_schemas[patch_key]
            elif selected:
                patched=json.loads(json.dumps(expanded))
                for item in selected:
                    path = item['path']
                    node=patched
                    for segment in path[:-1]: node=node[segment]
                    if item.get('predicate') and path[-1] == 'pattern':
                        pattern = node['pattern']
                        if item['predicate'] == 'original_server_required':
                            # Only the Server component's nonempty clause.
                            node['pattern'] = pattern.replace(')+', ')*', 1)
                        elif item['predicate'] == 'scope':
                            name = patched['oneOf'][0]['properties']['event_type']['const']
                            node['pattern'] = '(?:' + pattern + '|^' + re.escape(name) + r':[0-9a-f]{64}(?![\s\S]))'
                        elif item['predicate'] in ('key_syntax','key_scope_format'):
                            name=patched['oneOf'][0]['properties']['event_type']['const']
                            general='^(?:'+APP_KEY+'|'+re.escape(name)+r':[0-9a-f]{64})(?![\s\S])'
                            if item['predicate']=='key_scope_format':
                                node['pattern']=general
                            else:
                                node.pop('pattern')
                                node.setdefault('allOf',[]).append({'anyOf':[
                                    {'not':{'pattern':general}}, {'pattern':pattern}]})
                        else: raise ValueError('unclassified key predicate')
                    elif path[-1] == 'anyOf':
                        branches = node.pop('anyOf')
                        assert all('type' in branch for branch in branches)
                        node.setdefault('allOf', []).extend(
                            {'if': {'type': branch['type']},
                             'then': {k: v for k, v in branch.items() if k != 'type'}}
                            for branch in branches)
                    elif item.get('predicate') and path[-1] == 'const':
                        value = node.pop('const')
                        if item['predicate'] == 'replay_only':
                            node['enum'] = [value, 'projector_replay_only']
                        else:
                            node['not'] = {'const': 'projector_replay_only'}
                    elif (path[-1] == 'pattern' and item['field'][-1:] == ['server_id']):
                        # Preserve the no-CR/LF clause while cutting nonempty.
                        node['pattern'] = node['pattern'].replace('+', '*', 1)
                    elif item.get('members') and path[-1] == 'required':
                        node['required'] = [k for k in node['required'] if k not in item['members']]
                    elif item.get('members') and path[-1] == 'additionalProperties':
                        for field in item['members']: node.setdefault('properties', {})[field] = {}
                    else:
                        node.pop(path[-1], None)
            patched_schemas[patch_key]=patched
            validator=actual(patched,*args,**kwargs)
            if capture is None: return validator
            class Observed:
                def iter_errors(self,value):
                    errors=list(validator.iter_errors(value))
                    if errors:
                        capture.append({'role':role,'schema_sha256':resource,'definition':expanded,
                            'errors':[{'path':list(e.absolute_schema_path),'field':list(e.absolute_path),
                                       'keyword':e.validator,
                                       'members': ([k for k in e.validator_value if k not in e.instance]
                                           if e.validator == 'required' else
                                           [k for k in e.instance if k not in e.schema.get('properties', {})]
                                           if e.validator == 'additionalProperties' else [])}
                                      for error in errors for e in leaves(error,value)]})
                    return iter(errors)
                def __getattr__(self,key): return getattr(validator,key)
            return Observed()
        @staticmethod
        def check_schema(schema): return checked_schema(json.dumps(schema,sort_keys=True))
    m['Draft202012Validator']=Validator
    return m


def outcome(probe,m,schema,positive=False,refusals=None):
    m['_dg6b_trace'].clear()
    try: probe.call(m,schema,positive)
    except Exception as exc:
        if refusals is not None:
            tb=exc.__traceback__
            selected=None
            while tb:
                if tb.tb_frame.f_code.co_filename==str(CHECKER):
                    selected=f"{guard_name(str(exc))}@{tb.tb_frame.f_code.co_name}:{tb.tb_lineno}"
                tb=tb.tb_next
            refusals.append(m['_dg6b_trace'][-1] if m['_dg6b_trace'] else selected)
        return type(exc).__name__+': '+str(exc)
    return 'accepted'


def available_memory():
    for line in Path('/proc/meminfo').read_text().splitlines():
        if line.startswith('MemAvailable:'): return int(line.split()[1])//(1024*1024)
    raise RuntimeError('MemAvailable unavailable')


def discover(source,schema,probe):
    """Follow only exact schema duplicates and this named runtime invariant.

    Discovery always restarts the whole callback. It never removes a second
    unrelated runtime refusal, so stale-copy masks cannot be hidden here.
    """
    runtime=set(); keywords={}; trace=[]
    allowed_fields={part for path in changes(probe.positive,probe.negative) for part in path if isinstance(part,str)}
    if 'revision' in allowed_fields: allowed_fields.add('owner_revision')
    if probe.guard in ('scope','partition'): allowed_fields.add('scope_key')
    if probe.guard=='original_server_required': allowed_fields.add('idempotency_key')
    for _ in range(24):
        captured=[]
        m=module_for(source,runtime,list(keywords.values()),captured)
        refusals=[]
        result=outcome(probe,m,schema,refusals=refusals)
        trace.append(result)
        if result=='accepted':
            return {'runtime':sorted(runtime),'keywords':list(keywords.values()),'trace':trace}
        if captured:
            for error in captured[-1]['errors']:
                observation=captured[-1]
                item={'role':observation['role'],'schema_sha256':observation['schema_sha256'],
                      'path':error['path'],'field':error['field'],'keyword':error['keyword'],'members':error['members']}
                if error['field'] == ['idempotency_key'] and error['keyword'] == 'pattern':
                    item['predicate'] = probe.guard
                    if probe.guard == 'idempotency_key':
                        name=probe.id.split(':',1)[0];key=probe.negative['event_record']['idempotency_key']
                        general=APP_KEY+'|'+re.escape(name)+r':[0-9a-f]{64}'
                        item['predicate']='key_scope_format' if re.fullmatch(general,key) else 'key_syntax'
                if error['field'] == ['replay_policy'] and error['keyword'] == 'const':
                    item['predicate'] = 'replay_only' if probe.id.endswith('replay_only_append') else 'other_policy'
                if error['field'] and not any(part in allowed_fields for part in error['field']):
                    return {'error':'unrelated schema field masks the target','actual':result,'field':error['field'],'allowed_fields':sorted(allowed_fields),'trace':trace}
                key=json.dumps([item['role'],item['schema_sha256'],item['path'],item['members'],item.get('predicate')])
                keywords[key]=item
        elif result.startswith('ValueError: ') and guard_name(result[12:]) in (
                {'retry_identity','idempotency_conflict','original_payload_conflict'} if probe.guard=='retry_immutability' else {probe.guard}):
            if not refusals or refusals[-1] is None:
                return {'error':'no exact runtime refusal site','actual':result,'trace':trace}
            runtime.add(refusals[-1])
        else:
            return {'error':'complete-path target is masked','actual':result,'runtime':sorted(runtime),
                    'keywords':list(keywords.values()),'trace':trace}
    return {'error':'duplicate discovery did not converge','trace':trace}


def run_family(row,source,schema):
    stock=module_for(source)
    raw={'__file__':str(CHECKER),'__name__':'dg6b_stock_checker'}
    exec(compile(source,str(CHECKER),'exec'),raw)
    probes=family_probes(stock,row)
    failures=[]; groups={}; positives=[]; stock_results={}
    for p in probes:
        if available_memory()<6: raise RuntimeError('pause: available RAM under 6 GB')
        good=outcome(p,stock,schema,True)
        bad=outcome(p,stock,schema)
        positives.append({'id':p.id,'outcome':good,'input_changes':changes(p.positive,p.negative),'defect':p.defect,'mode':p.mode})
        stock_results[p.id]=bad
        try: p.call(raw,schema); raw_bad='accepted'
        except Exception as exc: raw_bad=type(exc).__name__+': '+str(exc)
        if bad != raw_bad: failures.append({'id':p.id,'phase':'instrumentation','raw':raw_bad,'instrumented':bad})
        if good!='accepted': failures.append({'id':p.id,'phase':'positive','actual':good})
        if bad=='accepted': failures.append({'id':p.id,'phase':'stock','actual':bad})
        removal=discover(source,schema,p)
        if 'error' in removal:
            failures.append({'id':p.id,'phase':'isolation',**removal});continue
        atoms={('runtime',item) for item in removal['runtime']} | {
            ('schema',json.dumps([k['role'],k['schema_sha256'],k['path'],k.get('members',[]),k.get('predicate')])) for k in removal['keywords']}
        # Exact cuts only. Intersecting sites never merge independent fields
        # or clauses of a compound refusal into a purported duplicate set.
        group_name=p.guard+'/'+digest(sorted(atoms))[:12]
        group=groups.setdefault(group_name,{'runtime':set(),'keywords':{},'targets':[],'discoveries':[],'atoms':set()})
        group['atoms'].update(atoms)
        group['runtime'].update(removal['runtime'])
        for k in removal['keywords']: group['keywords'][json.dumps([k['role'],k['schema_sha256'],k['path'],k.get('members',[]),k.get('predicate')])]=k
        group['targets'].append(p.id)
        group['discoveries'].append({'id':p.id,'trace':removal['trace']})
    table=[]; site_evaluations=0; peer_checks=[]
    for guard,group in sorted(groups.items()):
        if available_memory()<6: raise RuntimeError('pause: available RAM under 6 GB')
        keywords=list(group['keywords'].values()); runtime=sorted(group['runtime'])
        mutant=module_for(source,runtime,keywords)
        flips=[];stays=[];unexpected=[]
        for p in probes:
            result=outcome(p,mutant,schema)
            if p.id in group['targets']:
                if result=='accepted': flips.append(p.id)
                else: unexpected.append({'id':p.id,'expected':'accepted','actual':result})
            elif result==stock_results[p.id]: stays.append(p.id)
            else: unexpected.append({'id':p.id,'expected':stock_results[p.id],'actual':result})
        failures.extend({'guard':guard,**e} for e in unexpected)
        # The same invariant must be enforced independently by every named
        # site. Removing one site retains its peers; retaining only one site
        # shows that site really enforces the target. No union by overlap.
        site_proof=[]
        sites=[('runtime',x) for x in runtime]+[('schema',x) for x in keywords]
        targets=[p for p in probes if p.id in group['targets']]
        if len(sites)>1:
            for index,site in enumerate(sites):
                alone=[site]; others=sites[:index]+sites[index+1:]
                record={'site':site,'remove_only_this_site':{},'retain_only_this_site':{}}
                for label,selected in [('remove_only_this_site',alone),('retain_only_this_site',others)]:
                    partial=module_for(source,[x for kind,x in selected if kind=='runtime'],
                                       [x for kind,x in selected if kind=='schema'])
                    for p in targets:
                        result=outcome(p,partial,schema);site_evaluations+=1
                        record[label][p.id]=result
                        if result=='accepted':
                            failures.append({'guard':guard,'id':p.id,'phase':label,'site':site,'actual':result})
                site_proof.append(record)
        # Sol's two-defect probe is supplementary, never a single-defect
        # target. The authenticity peer stays enabled in the retained cut.
        retained=next((p for p in targets if p.id.endswith('history_type/retained/false_string')),None)
        if retained:
            combined=copy.deepcopy(retained);combined.negative['authentic']=False
            result=outcome(combined,mutant,schema)
            peer_checks.append({'guard':guard,'probe':'retained="false" plus authentic=false',
                                'single_defect':outcome(retained,mutant,schema),'combined':result})
            if result!='ValueError: historical_provenance':
                failures.append({'guard':guard,'phase':'independent_authenticity_peer','actual':result})
        table.append({'guard':guard,'removed_runtime_guards':runtime,'removed_schema_keywords':keywords,
            'duplicate_set':len(keywords)+len(runtime)>1,'duplicate_reason':
            'Repeated enforcement of the named input invariant at the listed full-path callsites.' if len(keywords)+len(runtime)>1 else None,
            'per_site_duplicate_proof':site_proof,
            'input_defects':sorted({p.defect for p in targets}),
            'negatives_that_flip':flips,'negatives_that_stay_rejected':stays,'unexpected':unexpected,
            'discovery':group['discoveries']})
        print(row['event_type'],guard,'flip',len(flips),'stay',len(stays),'unexpected',len(unexpected),flush=True)
    restored=module_for(source)
    restoration={p.id:outcome(p,restored,schema) for p in probes}
    if restoration!=stock_results: failures.append({'phase':'restore','error':'stock outcomes changed'})
    raw={'__file__':str(CHECKER),'__name__':'dg6b_restored_checker'}
    exec(compile(source,str(CHECKER),'exec'),raw)
    full=raw['run'](family=row['event_type'])
    if full['status']!='pass': failures.append({'phase':'restore','error':'fresh complete checker failed'})
    return {'event_type':row['event_type'],'status':'pass' if not failures else 'fail',
        'negative_count':len(probes),'guard_count':len(table),'complete_path_evaluations':len(probes)*len(table),
        'duplicate_site_evaluations':site_evaluations,'peer_checks':peer_checks,
        'unproved_guards':len({f.get('guard',f.get('id')) for f in failures}),
        'positive_controls':positives,'stock_outcomes':stock_results,'guard_removal_table':table,
        'failures':failures,'restored':restoration==stock_results,'restored_full_checker':full['status']}


def run(family=None):
    paths=[CHECKER,Path(__file__).resolve(),ROOT/'scripts/pm_dg6b_full_oracles.py',
        ROOT/'Plans/dg6b_event_contract_fixtures.json',ROOT/'Plans/dg6b_event_contracts.schema.json',ROOT/'Plans/shared_integration_runtime.schema.json',
        ROOT/'Plans/event_record.schema.json',ROOT/'Plans/event_record_index_checkpoint.schema.json']
    pins={str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
    source=CHECKER.read_text(); schema=json.loads((ROOT/'Plans/dg6b_event_contracts.schema.json').read_text());fixtures=json.loads((ROOT/'Plans/dg6b_event_contract_fixtures.json').read_text())
    rows=[]
    for row in fixtures['families']:
        if family and row['event_type']!=family: continue
        if available_memory()<6: raise RuntimeError('pause: available RAM under 6 GB')
        rows.append(run_family(row,source,schema))
    if not rows: raise ValueError('no matching family')
    for p in paths:
        if hashlib.sha256(p.read_bytes()).hexdigest()!=pins[str(p.relative_to(ROOT))]:raise RuntimeError('input changed during proof')
    return {'status':'pass' if all(r['status']=='pass' for r in rows) else 'fail',
        'method':__doc__,'native_execution':'NOT_RUN','input_sha256':pins,'families':rows,
        'negative_count':sum(r['negative_count'] for r in rows),'guard_count':sum(r['guard_count'] for r in rows),
        'complete_path_evaluations':sum(r['complete_path_evaluations'] for r in rows),
        'failures':[{'event_type':r['event_type'],**e} for r in rows for e in r['failures']]}


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family',help='Run one family; families always execute serially.')
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args()
    report=run(args.family);args.output.write_text(json.dumps(report,indent=2)+'\n')
    print(report['status'],'complete-path negatives',report['negative_count'],'guard rows',report['guard_count'],
          'failures',len(report['failures']))
    raise SystemExit(0 if report['status']=='pass' else 1)
