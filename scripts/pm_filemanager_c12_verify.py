#!/usr/bin/env python3
"""Verify the delivered DFM C12 evidence, source pins, and branch implications."""
import argparse
import collections
import gzip
import hashlib
import importlib.util
import itertools
import json
from pathlib import Path
import sys

sys.path.insert(0,str(Path(__file__).resolve().parent))
_spec=importlib.util.spec_from_file_location('c12_verify_core',Path(__file__).with_name('pm-filemanager-c12-closure.py'))
c12=importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(c12)


def read(path):
    with (gzip.open(path,'rt') if path.suffix=='.gz' else path.open()) as handle:
        return json.load(handle)


def branch_implications():
    projector=c12.LocalSamples(c12.dfm.schema_documents())
    references,unions=[],[]
    for (doc,ptr),node in projector.nodes.items():
        if not isinstance(node,dict):continue
        if '$ref' in node:
            references.append({'document':doc,'pointer':ptr+'/$ref',
                               'target':list(projector.reference(doc,node['$ref']))})
        if 'oneOf' not in node:continue
        branches=[]
        for i,branch in enumerate(node['oneOf']):
            if '$ref' in branch:
                branch=projector.nodes[projector.reference(doc,branch['$ref'])]
            branches.append(branch)
        pairs=[]
        for i,j in itertools.combinations(range(len(branches)),2):
            left,right=branches[i],branches[j]
            reason=None
            if left.get('type')=='null' and right.get('type')=='object' or right.get('type')=='null' and left.get('type')=='object':
                reason={'rule':'disjoint JSON null/object types'}
            for field in set(left.get('required',[])) & set(right.get('required',[])):
                a=left.get('properties',{}).get(field,{})
                b=right.get('properties',{}).get(field,{})
                if 'const' in a and 'const' in b and not c12.dfm.same_value(a['const'],b['const']):
                    reason={'rule':'different constants for the same required discriminator','field':field,
                            'left':a['const'],'right':b['const']}
                    break
            if reason is None:
                for a,b in ((left,right),(right,left)):
                    forbidden=set(a.get('required',[]))-set(b.get('properties',{}))
                    if forbidden and b.get('additionalProperties') is False and not b.get('patternProperties') and b.get('type')=='object':
                        reason={'rule':'a required member of one branch is forbidden by the other closed object',
                                'members':sorted(forbidden)}
                        break
            assert reason is not None,('unproved oneOf overlap',doc,ptr,i,j)
            pairs.append({'left':i,'right':j,**reason})
        unions.append({'document':doc,'pointer':ptr+'/oneOf','pairs':pairs})
    return {'status':'pass','references':references,'oneOf_max_matches':unions}


def verify(evidence,schema_only=False):
    root=c12.ROOT
    guards=read(evidence/'guards/summary.json')
    assert not guards['findings']
    unproved=set()
    own=stays=masked=unrelated=proved=0
    for table in guards['suites']:
        assert 1<=len(table['rows'])<=8 and not table['lane_matrix']
        unproved.update(table['rows_without_negative'])
        if 'report' not in table:
            assert len(table['rows'])==1 and len(table['rows_without_negative'])==1
            continue
        report_path=evidence/'guards'/table['report']
        assert hashlib.sha256(report_path.read_bytes()).hexdigest()==table['report_sha256']
        report=read(report_path)
        assert report['status']=='PASS' and not report['failures'] and not report['masked_negatives']
        assert report['tool_sha256']==guards['tool_sha256']
        for row in report['rows']:
            assert row['proved'] and not row['masked'] and not row['unrelated_changes']
            proved+=1
            own+=len(row['flips'])
            stays+=len(row['stays'])
    assert unproved=={'IS02_integer_range','QJ03_jcs_other','OD03_dispatch_other'}
    assert proved==234 and sum(len(t['rows']) for t in guards['suites'])==237
    for path,pin in guards['source_sha256'].items():
        assert hashlib.sha256((root/path).read_bytes()).hexdigest()==pin,path
    schema=read(evidence/'schema-bound.json.gz')
    assert schema['status']=='pass' and not schema['unresolved'] and schema['accounted_invalid']
    for path,pin in schema['execution_source_sha256'].items():
        assert hashlib.sha256((root/path).read_bytes()).hexdigest()==pin,path
    proofs={e['proof'] for e in schema['ledger'] if e['result']=='COVERED'}
    assert len(schema['invalid'])==7
    for entry in schema['ledger']:
        if entry['result']=='EXACT_REFUSAL_ALIAS':
            assert entry['proof'] in proofs and entry['actual']==entry['expected']
        else:
            assert c12.credited_trial(entry['control_outcome'],entry['actual'],entry['cut'],entry['restored'],entry['expected'])
    for entry in schema['additional_clause_proofs']:
        assert c12.credited_trial(entry['control_outcome'],entry['actual'],entry['cut'],entry['restored'],entry['expected'])
        proofs.add(entry['id'])
    entailed={(e['document'],e['pointer']) for e in schema['entailments']}
    nodes=c12.schema_nodes(c12.dfm.schema_documents())
    scalar_total=scalar_cut=scalar_entailed=0
    for entry in schema['inventory']:
        assert all(proof in proofs for proof in entry['proofs']),entry
        node=nodes[(entry['document'],entry['schema_node'])]
        scalar=(entry['keyword'] in set(c12.g.SCALARS)|{'required','not'} or
                entry['keyword']=='additionalProperties' and node['additionalProperties'] is False)
        entry['classification']='scalar' if scalar else 'routing'
        if scalar:
            scalar_total+=1
            scalar_cut+=bool(entry['proofs'])
            scalar_entailed+=(entry['document'],entry['pointer']) in entailed
            assert entry['proofs'] or (entry['document'],entry['pointer']) in entailed,entry
    covered={(guard['document'],guard['pointer']) for e in schema['ledger'] if e['result']=='COVERED' for guard in e['guards']}
    covered.update((e['guard']['document'],e['guard']['pointer']) for e in schema['additional_clause_proofs'])
    aggregate=covered-{(e['document'],e['pointer']) for e in schema['inventory']}
    assert all(pointer.endswith('/required') for doc,pointer in aggregate),aggregate
    summary=dict(schema['summary'],additional_invalid=len(schema['additional_invalid']),
                 scalar_clauses=scalar_total,scalar_cut_covered=scalar_cut,scalar_entailed=scalar_entailed,
                 whole_required_list_cuts=len(aggregate),source_pins=len(schema['execution_source_sha256']))
    matrix=[{k:e[k] for k in ('document','pointer','keyword','proofs','classification')} for e in schema['inventory']]
    summary['authored_aliases']=sum(e['result']=='EXACT_REFUSAL_ALIAS' for e in schema['ledger'])
    summary['entailment_records']=schema['entailments']
    summary['invalid_ids']=[e['id'] for e in schema['invalid']]
    del schema
    branches=branch_implications()
    if schema_only:
        return {'status':'schema-pass','schema':summary,'matrix':matrix,'branches':branches,
                'guards':{'tables':len(guards['suites']),'rows':237,'proved':proved,'unproved':sorted(unproved),
                          'own_flips':own,'stays':stays,'masked':masked,'unrelated':unrelated}}
    times=[]
    families=set()
    for name in ('time-a','time-b','time-c'):
        result=read(evidence/name/'timestamps.json.gz')
        assert result['status']=='pass' and not result['failures']
        assert all(e['store_unchanged'] for e in result['complete_boundary'])
        families.update(e['family'] for e in result['complete_boundary'])
        times.append(result['summary'])
    assert len(families)==12 and sum(t['complete_boundary'] for t in times)==81840
    assert sum(t['leaf'] for t in times)==12276
    retained=read(evidence/'runtime/retained.json.gz')
    assert retained['status']=='pass' and not retained['failures'] and len(retained['observations'])==72
    for entry in retained['observations']:
        assert entry['expected']==entry['actual'] and entry['store_unchanged'] and entry['before']==entry['after']
        assert c12.digest(retained['stores'][entry['before']])==entry['before']
    joins=read(evidence/'runtime/joins.json.gz')
    assert joins['status']=='pass' and len(joins['witnesses'])==192
    assert all(e['distinct_copies'] and e['actual']['row']==e['expected_row'] for e in joins['witnesses'])
    numbers=read(evidence/'numbers.json')
    assert numbers['status']=='pass' and numbers['runs']==6888 and numbers['disagreement_count']==0
    shared=read(evidence/'shared-numbers.json')
    assert shared['status']=='pass' and shared['case_passes']==580
    return {'status':'pass','schema':summary,'matrix':matrix,'branches':branches,
            'guards':{'tables':len(guards['suites']),'rows':237,'proved':proved,'unproved':sorted(unproved),
                      'own_flips':own,'stays':stays,'masked':masked,'unrelated':unrelated},
            'timestamps':times,'retained':72,'joins':192,'families':sorted(families)}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--evidence',type=Path,required=True)
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--schema-only',action='store_true')
    args=parser.parse_args()
    result=verify(args.evidence,args.schema_only)
    args.out.write_text(json.dumps(result,indent=1,sort_keys=True)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k not in ('matrix','schema','branches')},sort_keys=True))
    return 0


if __name__=='__main__':
    raise SystemExit(main())
