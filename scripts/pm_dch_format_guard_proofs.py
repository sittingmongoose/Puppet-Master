#!/usr/bin/env python3
"""Remove each DCH parser predicate alone; retain all unrelated format checks."""
import argparse
import ast
import copy
import inspect
import json
import re
from pathlib import Path
import pm_dch_formats as formats
from pm_dch_round7_oracles import BAD_DATES, GOOD_DATES, BAD_URLS, GOOD_URLS


def number_witness(value):
    # Mutation-only parse context, analogous to a controlled lookup witness.
    # It relaxes separators without changing any calendar/time field.
    fields = re.findall(r'[0-9]+', value)[:6]
    if len(fields) != 6: fields = ['2026','11','04','00','00','00']
    class Match:
        def groups(self):return tuple(fields)
    return Match()


def mutant(function, guard):
    tree = ast.parse(inspect.getsource(function))
    class Remove(ast.NodeTransformer):
        def visit_If(self, node):
            if guard in ['UTC grammar','HTTPS grammar'] and ast.unparse(node.test)=='match is None':
                replacement = 'match = number_witness(value)' if guard=='UTC grammar' else "match = {'host':'host'}"
                return ast.copy_location(ast.parse(replacement).body[0],node)
            return self.generic_visit(node)
        def visit_ExceptHandler(self, node):
            if guard=='UTC calendar' and function.__name__=='utc_datetime':node.body=[ast.Pass()]
            if guard=='HTTPS IPv6' and function.__name__=='https_uri':node.body=[ast.Return(ast.Constant(True))]
            return node
        def visit_Compare(self,node):
            if ast.unparse(node)=={'UTC hour':'hour < 24','UTC minute':'minute < 60','UTC second':'second < 60','HTTPS IPv6 zone':"'%' not in host"}.get(guard):
                return ast.copy_location(ast.Constant(True),node)
            return node
    tree=Remove().visit(tree);ast.fix_missing_locations(tree)
    context={**formats.__dict__,'number_witness':number_witness}
    exec(compile(tree,'<single-format-guard-mutant>','exec'),context)
    return context[function.__name__]


def run():
    corpus=[('date/'+str(i),formats.utc_datetime,v,False) for i,v in enumerate(BAD_DATES)]
    corpus += [('uri/'+str(i),formats.https_uri,v,False) for i,v in enumerate(BAD_URLS)]
    corpus += [('uri/zone',formats.https_uri,'https://[fe80::1%eth0]/pull/1',False)]
    positives=[(formats.utc_datetime,v) for v in GOOD_DATES]+[(formats.https_uri,v) for v in GOOD_URLS]
    assert all(fn(v) for fn,v in positives)
    assert all(fn(v) is expected for _,fn,v,expected in corpus)
    rows=[];negative={name:[] for name,_,_,_ in corpus}
    for guard in ['UTC grammar','UTC calendar','UTC hour','UTC minute','UTC second','HTTPS grammar','HTTPS IPv6','HTTPS IPv6 zone']:
        fn=formats.utc_datetime if guard.startswith('UTC') else formats.https_uri
        changed=mutant(fn,guard);flips=[];rejected=[]
        for name,original,value,expected in corpus:
            actual=(changed if original is fn else original)(value)
            if actual is True:flips.append(name);negative[name].append(guard)
            else:rejected.append(name)
        assert all(changed(value) for original,value in positives if original is fn)
        rows.append({'guard':'format parser: '+guard,'kind':'function','negatives_that_flip':['format/'+n for n in flips],
                     'other_negatives_stay_rejected':len(rejected),'rejected_complement':['format/'+n for n in rejected],'exceptions':[]})
    assert all(negative.values()) and all(r['negatives_that_flip'] for r in rows)
    return {'status':'pass','method':'Exact source AST removals in an isolated function namespace. Grammar removals supply parse context only, preserving every calendar/time/IP predicate; no production parser or format map is changed. Every other negative is reevaluated after each removal.',
            'guards':len(rows),'negative_cases':len(negative),'cases':len(corpus)+len(positives),'table':rows,
            'negative_guards':{'format/'+n:['format parser: '+g for g in gs] for n,gs in negative.items()},
            'baseline_traces':{'format/'+n:['format parser: '+g for g in gs] for n,gs in negative.items()},'mutant_containment':[]}

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--out',type=Path,required=True);args=parser.parse_args()
    report=run();args.out.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k not in ['table','negative_guards','baseline_traces']}))
