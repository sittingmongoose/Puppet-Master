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
        return [e for child in error.context for e in leaves(child,value)]
    return [error]


@cache
def compiled_module(source, runtime):
    class Remove(ast.NodeTransformer):
        function = None
        def visit_FunctionDef(self,node):
            previous,self.function=self.function,node.name
            result=self.generic_visit(node)
            self.function=previous
            return result
        def selected(self,node):
            return f"{guard_name(reason(node.exc))}@{self.function}:{node.lineno}" in runtime
        def visit_If(self,node):
            if len(node.body)==1 and isinstance(node.body[0],ast.Raise) and self.selected(node.body[0]):
                node.test=ast.Constant(False)
                return node
            return self.generic_visit(node)
        def visit_Raise(self,node):
            if self.selected(node): return ast.copy_location(ast.Pass(),node)
            return node
    tree=Remove().visit(ast.parse(source)); ast.fix_missing_locations(tree)
    return compile(tree,str(CHECKER),'exec')


EXPANDED = {}
PURE_HELPERS = {}

def module_for(source, runtime=(), keywords=(), capture=None):
    m={'__file__':str(CHECKER),'__name__':'dg6b_full_guard_mutant'}
    exec(compiled_module(source,tuple(sorted(runtime))),m)
    # Cache immutable schema construction and file parsing only. Every call
    # still runs instance validation, joins, byte encoding and all semantics.
    for name in ('load_plan','payload_type_definition','workflow_scope_schema','durable_token_schema','persona_io_definition'):
        if name not in PURE_HELPERS: PURE_HELPERS[name]=m[name]
        else: m[name]=PURE_HELPERS[name]
    actual=m['Draft202012Validator']
    class Validator:
        def __new__(cls,definition,*args,**kwargs):
            # All schemas still execute at their original production callsite.
            import sys
            role=sys._getframe(1).f_code.co_name
            key=json.dumps(definition,sort_keys=True,separators=(',',':'))
            if key not in EXPANDED:
                from referencing import Registry, Resource
                from referencing.jsonschema import DRAFT202012
                registry=kwargs.get('registry',Registry())
                resolver=registry.resolver_with_root(Resource.from_contents(definition,default_specification=DRAFT202012))
                expanded=expand_refs(definition,resolver)
                EXPANDED[key]=(expanded,digest(expanded))
            expanded,resource=EXPANDED[key]
            selected=[tuple(k['path']) for k in keywords if k['role']==role and k['schema_sha256']==resource]
            patched=expanded
            if selected:
                patched=json.loads(json.dumps(expanded))
                for path in sorted(set(selected),key=repr):
                    node=patched
                    for segment in path[:-1]: node=node[segment]
                    del node[path[-1]]
            validator=actual(patched,*args,**kwargs)
            if capture is None: return validator
            class Observed:
                def iter_errors(self,value):
                    errors=list(validator.iter_errors(value))
                    if errors:
                        capture.append({'role':role,'schema_sha256':resource,'definition':expanded,
                            'errors':[{'path':list(e.absolute_schema_path),'field':list(e.absolute_path),
                                       'keyword':e.validator} for error in errors for e in leaves(error,value)]})
                    return iter(errors)
                def __getattr__(self,key): return getattr(validator,key)
            return Observed()
        @staticmethod
        def check_schema(schema): return checked_schema(json.dumps(schema,sort_keys=True))
    m['Draft202012Validator']=Validator
    return m


def outcome(probe,m,schema,positive=False,refusals=None):
    try: probe.call(m,schema,positive)
    except Exception as exc:
        if refusals is not None:
            tb=exc.__traceback__
            selected=None
            while tb:
                if tb.tb_frame.f_code.co_filename==str(CHECKER):
                    selected=f"{guard_name(str(exc))}@{tb.tb_frame.f_code.co_name}:{tb.tb_lineno}"
                tb=tb.tb_next
            refusals.append(selected)
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
                      'path':error['path'],'field':error['field'],'keyword':error['keyword']}
                if error['field'] and not any(part in allowed_fields for part in error['field']):
                    return {'error':'unrelated schema field masks the target','actual':result,'field':error['field'],'allowed_fields':sorted(allowed_fields),'trace':trace}
                key=json.dumps([item['role'],item['schema_sha256'],item['path']])
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
    probes=family_probes(stock,row)
    failures=[]; groups={}; positives=[]; stock_results={}
    for p in probes:
        if available_memory()<6: raise RuntimeError('pause: available RAM under 6 GB')
        good=outcome(p,stock,schema,True)
        bad=outcome(p,stock,schema)
        positives.append({'id':p.id,'outcome':good,'input_changes':changes(p.positive,p.negative),'defect':p.defect,'mode':p.mode})
        stock_results[p.id]=bad
        if good!='accepted': failures.append({'id':p.id,'phase':'positive','actual':good})
        if bad=='accepted': failures.append({'id':p.id,'phase':'stock','actual':bad})
        removal=discover(source,schema,p)
        if 'error' in removal:
            failures.append({'id':p.id,'phase':'isolation',**removal});continue
        atoms={('runtime',item) for item in removal['runtime']} | {
            ('schema',json.dumps([k['role'],k['schema_sha256'],k['path']])) for k in removal['keywords']}
        intersecting=[key for key,g in groups.items() if g['atoms'] & atoms]
        group_name=(intersecting[0] if intersecting else p.guard+'/'+digest(sorted(atoms))[:12])
        group=groups.setdefault(group_name,{'runtime':set(),'keywords':{},'targets':[],'discoveries':[],'atoms':set()})
        for key in intersecting[1:]:
            other=groups.pop(key)
            group['runtime'].update(other['runtime']);group['keywords'].update(other['keywords'])
            group['targets'].extend(other['targets']);group['discoveries'].extend(other['discoveries'])
            group['atoms'].update(other['atoms'])
        group['atoms'].update(atoms)
        group['runtime'].update(removal['runtime'])
        for k in removal['keywords']: group['keywords'][json.dumps([k['role'],k['schema_sha256'],k['path']])]=k
        group['targets'].append(p.id)
        group['discoveries'].append({'id':p.id,'trace':removal['trace']})
    table=[]
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
        table.append({'guard':guard,'removed_runtime_guards':runtime,'removed_schema_keywords':keywords,
            'duplicate_set':len(keywords)+len(runtime)>1,'duplicate_reason':
            'Repeated enforcement of the named input invariant at the listed full-path callsites.' if len(keywords)+len(runtime)>1 else None,
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
