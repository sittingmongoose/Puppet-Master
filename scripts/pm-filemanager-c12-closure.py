#!/usr/bin/env python3
"""DFM C12 evidence over the original checker; never alters owner schemas on disk.

Whole-definition Method B rows remain the real refusal predicates. This bounded
DFM adapter records clause witnesses and schema-cut/restoration evidence separately
from the gated tool's row credit. Unknown, masked, and non-flipping trials earn no
credit. Inputs come from the existing authored DFM fixtures.
"""
import argparse
import collections
import copy
from contextlib import contextmanager
import gzip
import hashlib
import json
from pathlib import Path
import re
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pm_filemanager_guard_suites as suites
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

dfm, g, ROOT = suites.dfm, suites.g, suites.ROOT


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'),
                                     ensure_ascii=True).encode()).hexdigest()


def at(value, path):
    for key in path:
        value = value[key]
    return value


def pointer(path):
    return '#' + g.pointer(tuple(path))


def parts(ptr):
    return [p.replace('~1', '/').replace('~0', '~') for p in ptr.removeprefix('#/').split('/')] if ptr not in ('', '#') else []


def descend(value, path):
    for key in path:
        value = value[int(key) if isinstance(value, list) else key]
    return value


def outcome(action):
    try:
        action()
        return {'status': 'accepted'}
    except dfm.TableRefusal as error:
        return {'status': 'refused', 'phase': error.phase, 'row': error.row,
                'code': error.code, 'schema': error.schema}
    except Exception as error:
        return {'status': 'INVALID', 'type': type(error).__name__, 'message': str(error)[:240]}


def credited_trial(control, negative, cut, restored, expected):
    """Only the declared first refusal, its removal, and its restoration earn credit."""
    return (expected.get('status') == 'refused' and control == {'status':'accepted'}
            and negative == expected and cut == {'status':'accepted'} and restored == expected)


def build_registry(documents):
    resources = []
    for path, schema in documents.items():
        resource = Resource.from_contents(schema, default_specification=DRAFT202012)
        resources.append((dfm.SCHEMA_BASE + path, resource))
        if '$id' in schema:
            resources.append((schema['$id'], resource))
    return Registry().with_resources(resources).crawl()


@contextmanager
def schema_cut(documents, guards):
    changed = dict(documents)
    for doc in {guard['document'] for guard in guards}:
        changed[doc] = copy.deepcopy(documents[doc])
    # Remove required members by value, so multiple cuts cannot shift an index.
    required = []
    for guard in guards:
        path = parts(guard['pointer'])
        target = descend(changed[guard['document']], path[:-1])
        if isinstance(target, list):
            required.append((target, descend(documents[guard['document']], path)))
        else:
            target.pop(path[-1])
    for target, member in required:
        target.remove(member)
    original, sites = dfm.SCHEMAS, dfm._EVENT_RECORD_SITES
    dfm.SCHEMAS, dfm._EVENT_RECORD_SITES = build_registry(changed), {}
    try:
        yield
    finally:
        dfm.SCHEMAS, dfm._EVENT_RECORD_SITES = original, sites


def rule_values(row, case):
    control = (json.loads((ROOT / case['control_file']).read_text()) if 'control_file' in case
               else copy.deepcopy(case.get('control', row)))
    control = copy.deepcopy(at(control, case.get('control_path', [])))
    negative = copy.deepcopy(control)
    mutation = case['mutation']
    if not mutation['path']:
        negative = copy.deepcopy(mutation['value'])
    else:
        target = at(negative, mutation['path'][:-1])
        if mutation.get('delete'):
            del target[mutation['path'][-1]]
        else:
            target[mutation['path'][-1]] = copy.deepcopy(mutation['value'])
    return control, negative


def schema_nodes(documents):
    """Physical schema locations, including dormant definitions; no prose/data traversal."""
    found = {}
    def walk(doc, path, node):
        found[(doc, pointer(path))] = node
        if isinstance(node, dict):
            for key in g.MAPS:
                for name, child in node.get(key, {}).items():
                    if isinstance(child, (dict, bool)):
                        walk(doc, path + [key, name], child)
            for key in g.SINGLES:
                if isinstance(node.get(key), (dict, bool)):
                    walk(doc, path + [key], node[key])
            for key in g.ARRAYS:
                for i, child in enumerate(node.get(key, [])):
                    walk(doc, path + [key, i], child)
            if 'items' in node:
                items = node['items']
                if isinstance(items, list):
                    for i, child in enumerate(items):
                        walk(doc, path + ['items', i], child)
                elif isinstance(items, (dict, bool)):
                    walk(doc, path + ['items'], items)
    for doc, schema in documents.items():
        walk(doc, [], schema)
    return found


class LocalSamples:
    """Project authored controls onto their real schema/ref/branch locations."""
    def __init__(self, documents):
        self.documents = documents
        self.nodes = schema_nodes(documents)
        self.registry = build_registry(documents)
        self.locations = {id(n): key for key, n in self.nodes.items() if isinstance(n, dict)}
        self.values, self.visited, self.routes = {}, set(), []

    def accepts(self, doc, ptr, value):
        validator = dfm.jsonschema.Draft202012Validator({'$ref': dfm.SCHEMA_BASE+doc+ptr},
                    registry=self.registry, format_checker=dfm.DATE_TIME_FORMAT)
        with dfm.exact_integer_text():
            return next(validator.iter_errors(value), None) is None

    def reference(self, doc, reference):
        resolved = self.registry.resolver(dfm.SCHEMA_BASE+doc).lookup(reference)
        return self.locations[id(resolved.contents)]

    def seed(self, doc, ptr, value):
        ptr = ptr or '#'
        key = (doc, ptr)
        signature = key + (digest(value),)
        if signature in self.visited or not self.accepts(doc, ptr, value):
            return
        self.visited.add(signature)
        slot = self.values.setdefault(key, [])
        if len(slot) >= 32:
            return
        slot.append(copy.deepcopy(value))
        node = self.nodes[key]
        if not isinstance(node, dict):
            return
        if '$ref' in node:
            target=self.reference(doc,node['$ref'])
            self.routes.append({'document':doc,'pointer':ptr+'/$ref','target':list(target),'control':digest(value)})
            self.seed(*target, value)
        if isinstance(value, dict):
            for field, child in value.items():
                if field in node.get('properties', {}):
                    self.seed(doc, ptr+'/properties/'+field.replace('~','~0').replace('/','~1'), child)
                elif isinstance(node.get('additionalProperties'), dict):
                    self.seed(doc, ptr+'/additionalProperties', child)
        if isinstance(value, list) and isinstance(node.get('items'), (dict, bool)):
            for child in value[:8]:
                self.seed(doc, ptr+'/items', child)
        for keyword in ('allOf', 'anyOf', 'oneOf'):
            for i, _ in enumerate(node.get(keyword, [])):
                matches=self.accepts(doc,ptr+'/'+keyword+'/'+str(i),value)
                self.routes.append({'document':doc,'pointer':ptr+'/'+keyword+'/'+str(i),
                                    'matches':matches,'control':digest(value)})
                self.seed(doc, ptr+'/'+keyword+'/'+str(i), value)
        if 'if' in node:
            branch = 'then' if self.accepts(doc, ptr+'/if', value) else 'else'
            self.routes.append({'document':doc,'pointer':ptr+'/if','branch':branch,'control':digest(value)})
            self.seed(doc, ptr+'/if', value)
            if branch in node:
                self.seed(doc, ptr+'/'+branch, value)

    def synthesize(self, doc, ptr, stack=()):
        """Bounded closed-schema controls; every candidate must pass the original schema."""
        key = (doc, ptr)
        if key in self.values:
            return copy.deepcopy(self.values[key][0])
        if key in stack:
            raise ValueError('recursive control')
        node = self.nodes[key]
        if node is True:
            return None
        if not isinstance(node, dict):
            raise ValueError('false control')
        if '$ref' in node:
            value = self.synthesize(*self.reference(doc, node['$ref']), stack+(key,))
        elif 'const' in node:
            value = node['const']
        elif 'enum' in node:
            value = node['enum'][0]
        elif 'anyOf' in node or 'oneOf' in node:
            keyword = 'anyOf' if 'anyOf' in node else 'oneOf'
            value = self.synthesize(doc, ptr+'/'+keyword+'/0', stack+(key,))
        elif node.get('type') == 'object' or 'properties' in node or 'required' in node:
            value = {field: self.synthesize(doc, ptr+'/properties/'+field, stack+(key,))
                     if field in node.get('properties', {}) else 'x' for field in node.get('required', [])}
        elif node.get('type') == 'array':
            value = [self.synthesize(doc, ptr+'/items', stack+(key,)) for _ in range(node.get('minItems', 0))]
        elif node.get('type') in ('integer', 'number'):
            value = max(node.get('minimum', 0), node.get('exclusiveMinimum', -1)+1)
        elif node.get('type') == 'null':
            value = None
        elif node.get('type') == 'boolean':
            value = False
        else:
            candidates = ['x', '..', 'file.copied', 'fixture1', '2026-11-04T00:00:00Z', '0'*64,
                          'pmref:receipt:fixture1', 'pm-path-ref:v1:project:fixture1',
                          'filemanager_operation_custody.v1:'+'0'*64,
                          'pm-payload-ref:v1:blake3:'+'0'*64+':1:application/vnd.msgpack']
            candidates += ['x'*node.get('minLength', 1)]
            value = next((v for v in candidates if self.accepts(doc, ptr, v)), None)
        if not self.accepts(doc, ptr, value):
            raise ValueError('no authored or bounded valid control')
        self.seed(doc, ptr, value)
        return copy.deepcopy(value)


def proposals(node, keyword, member, control):
    """DFM's finite vocabulary; unproductive proposals remain explicit invalids."""
    if keyword == 'required' and isinstance(control, dict):
        changed = copy.deepcopy(control)
        changed.pop(node['required'][member], None)
        yield changed
    elif keyword == 'additionalProperties' and isinstance(control, dict):
        yield dict(control, c12_unknown_field=0)
    elif keyword in ('const', 'enum', 'type'):
        yield from [None, True, False, 0, 0.5, [], {}, 'c12_invalid']
    elif keyword in ('minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum'):
        yield node[keyword] + (-1 if keyword in ('minimum','exclusiveMinimum') else 1)
        yield node[keyword]
    elif keyword in ('minLength', 'maxLength') and isinstance(control, str):
        length = max(0, node[keyword]+(-1 if keyword == 'minLength' else 1))
        yield (control+'x'*length)[:length]
    elif keyword in ('pattern', 'not', 'format') and isinstance(control, str):
        yield from ['', 'garbage', control+'\n', control+'..', '2026-11-31T00:00:00Z', 'a/b']
        if control:
            yield '?' + control[1:]
            yield control[:-1]+'G'
    elif keyword in ('minItems', 'maxItems', 'uniqueItems') and isinstance(control, list):
        if keyword == 'minItems':
            yield control[:max(0,node[keyword]-1)]
        elif keyword == 'uniqueItems':
            yield control + control[:1]
        elif control:
            yield control + [copy.deepcopy(control[0])]*(node[keyword]+1-len(control))


def clause_entailment(projector, doc, ptr, node, keyword, member):
    """Checked DFM implications; each reason names its complete logical premise."""
    if keyword=='type' and node['type']=='string' and set(node.get('not',{}))=={'pattern'}:
        # JSON Schema pattern ignores every non-string, hence not(pattern) rejects all of them.
        return {'reason':'not(pattern) rejects every non-string by the JSON Schema applicability rule',
                'premises':[ptr+'/not/pattern']}
    if keyword in ('minLength','maxLength'):
        if keyword=='minLength' and node[keyword]==1 and node.get('format')=='date-time':
            assert not projector.accepts(doc,ptr,'')
            return {'reason':'empty string is refused by the installed CV-1101 date-time format; nonstrings do not activate minLength',
                    'premises':[ptr+'/format']}
        if 'pattern' in node:
            lower,upper=re._parser.parse(node['pattern'],0).getwidth()
            if keyword=='minLength' and lower>=node[keyword] or keyword=='maxLength' and upper<=node[keyword]:
                return {'reason':'regular-expression consumed-width bound entails string length',
                        'premises':[ptr+'/pattern'],'checked_width':[lower,upper],'bound':node[keyword]}
    if keyword in ('type','required') and 'oneOf' in node:
        targets=[]
        for branch in node['oneOf']:
            if set(branch)!={'$ref'}:break
            target=projector.reference(doc,branch['$ref'])
            body=projector.nodes[target]
            if keyword=='type' and body.get('type')!=node['type']:break
            if keyword=='required' and node['required'][member] not in body.get('required',[]):break
            targets.append(list(target))
        else:
            return {'reason':'every oneOf branch independently enforces the same type/required obligation',
                    'premises':targets}
    # Absent selectors activate all properties-only if clauses, whose required target types conflict.
    if doc==dfm.CONTRACTS and keyword=='required' and ptr in ('#/$defs/operation_custody','#/$defs/family_control'):
        selector='phase' if ptr.endswith('operation_custody') else 'state'
        if node['required'][member]==selector:
            a,b=(0,1)
            target='settlement' if selector=='phase' else 'admission_revision'
            branches=node['allOf']
            assert selector not in branches[a]['if'].get('required',[]) and selector not in branches[b]['if'].get('required',[])
            assert target in node['required']
            left=branches[a]['then']['properties'][target]
            right=branches[b]['then']['properties'][target]
            assert left=={'type':'null'}
            if selector=='phase':
                assert projector.nodes[projector.reference(doc,right['$ref'])]['type']=='object'
            else:assert right['type']=='string'
            return {'reason':'missing selector activates two if clauses requiring the same required field to be null and object/string',
                    'premises':[ptr+'/allOf/0',ptr+'/allOf/1',ptr+'/required'],'conflicting_field':target}
    if keyword=='type' and node['type']=='object' and doc=='storage_value_registry.schema.json' and ptr=='#/$defs/storage_profile/properties/family_profiles/additionalProperties':
        branch=node['allOf'][1]
        assert branch['if']['required']==['redb_file'] and branch['then']=={'not':{'required':['max_value_bytes']}}
        return {'reason':'on every nonobject the if required/properties clauses pass, then not(required) refuses; only objects can pass',
                'premises':[ptr+'/allOf/1']}
    return None


def extend_coverage(documents, fixtures, covered, samples):
    """Additional physical-clause witnesses at the original validate_shape boundary."""
    projector = LocalSamples(documents)
    for (doc, ptr), values in samples.items():
        for value in values:
            projector.seed(doc, ptr, value)
    for row in fixtures['rows']:
        name, model = row['event_type'], row['trace']['custody_model']
        projector.seed(dfm.PAYLOAD_DOCUMENT+name.replace('.','_')+'.schema.json', '#', row['payload'])
        for definition, value in [('operation_custody', model['operation_rows'][model['operation_key']]),
                                  ('family_control',model['control_rows'][model['control_key']])]:
            projector.seed(dfm.CONTRACTS, '#/$defs/'+definition, value)
        for case in row['transition_cases']:
            definition = 'operation_custody' if case['kind']=='operation' else 'family_control'
            for value in case.get('args', [])[:2]:
                if isinstance(value, dict):
                    projector.seed(dfm.CONTRACTS, '#/$defs/'+definition, value)
    projector.seed('storage_value_registry.schema.json', '#', json.loads((ROOT/'Plans/storage_value_registry.json').read_text()))
    for doc, ptr in list(projector.nodes):
        try:
            projector.synthesize(doc, ptr)
        except (ValueError, KeyError, TypeError, dfm.jsonschema.ValidationError):
            pass
    # Optional arrays need nonempty controls; pattern-only children need string controls.
    for (doc,ptr),node in projector.nodes.items():
        if not isinstance(node,dict):continue
        if set(node)=={'pattern'}:
            for value in ('..','x'):
                projector.seed(doc,ptr,value)
        if node.get('type')=='array' and 'items' in node:
            try:projector.seed(doc,ptr,[projector.synthesize(doc,ptr+'/items')])
            except (ValueError,KeyError,TypeError):pass
    ledger, unresolved, entailments, invalid = [], [], [], []
    for (doc, ptr), node in projector.nodes.items():
        if not isinstance(node, dict):
            continue
        for keyword in list(g.SCALARS)+['required','additionalProperties','not']:
            if keyword not in node or keyword=='additionalProperties' and node[keyword] is not False:
                continue
            for member in range(len(node[keyword])) if keyword=='required' else (None,):
                clause = ptr+'/'+keyword+('/'+str(member) if member is not None else '')
                key = (doc,clause)
                if covered.get(key):
                    continue
                implication=clause_entailment(projector,doc,ptr,node,keyword,member)
                if implication:
                    entailments.append({'document':doc,'pointer':clause,**implication})
                    continue
                # Logical entailments are checked against the complete allowed finite set.
                finite = [node['const']] if 'const' in node else node.get('enum')
                if keyword=='type' and finite is not None and all(
                    next(dfm.jsonschema.Draft202012Validator({'type':node['type']}).iter_errors(v),None) is None for v in finite):
                    entailments.append({'document':doc,'pointer':clause,'reason':'type entailed by complete const/enum domain',
                                        'premise':ptr+('/const' if 'const' in node else '/enum'),'values':finite})
                    continue
                if keyword in ('minLength','minItems','minimum') and node[keyword]==0:
                    if keyword in ('minLength','minItems'):
                        entailments.append({'document':doc,'pointer':clause,'reason':'zero lower cardinality bound cannot reject any JSON value'})
                        continue
                proved = False
                for control in projector.values.get((doc,ptr),[]):
                    for negative in proposals(node,keyword,member,control):
                        phase=dfm.schema_phase(doc,ptr)
                        expected={'status':'refused','phase':phase,'row':dfm.table_rows(phase)[0][0],
                                  'code':'schema','schema':{'validator':keyword,'path':[]}}
                        trial={'document':doc,'pointer':clause,'entry':ptr,'control':control,
                               'negative':negative,'expected':expected}
                        baseline=outcome(lambda:dfm.validate_shape(doc,ptr,negative))
                        trial['actual']=baseline
                        if baseline!=expected:
                            trial['reason']='no intended defect or masked by another clause'
                            invalid.append(trial)
                            continue
                        guard={'document':doc,'pointer':clause}
                        with schema_cut(documents,[guard]):
                            cut=outcome(lambda:dfm.validate_shape(doc,ptr,negative))
                        restored=outcome(lambda:dfm.validate_shape(doc,ptr,negative))
                        accepted=outcome(lambda:dfm.validate_shape(doc,ptr,control))
                        if not credited_trial(accepted,baseline,cut,restored,expected):
                            trial.update(reason='no isolated cut/restoration',cut=cut,restored=restored,control_outcome=accepted)
                            invalid.append(trial)
                            continue
                        proof=digest([doc,ptr,control,negative,guard])
                        ledger.append({'id':proof,'entry':ptr,'guard':guard,'control':control,'negative':negative,
                                       'expected':expected,'actual':baseline,'control_outcome':accepted,
                                       'cut':cut,'restored':restored,'result':'COVERED'})
                        covered[key].append(proof)
                        proved=True
                        break
                    if proved:break
                if not proved:
                    unresolved.append({'document':doc,'pointer':clause,'node':node,
                                       'controls':projector.values.get((doc,ptr),[])})
    routing=[]
    for (doc,ptr),node in projector.nodes.items():
        if not isinstance(node,dict):continue
        for keyword in ['$ref','properties','items','allOf','anyOf','oneOf','if','then','else','not']:
            if keyword not in node:continue
            entry={'document':doc,'pointer':ptr+'/'+keyword,'keyword':keyword,
                   'parent_controls':[digest(v) for v in projector.values.get((doc,ptr),[])]}
            if keyword=='$ref':
                entry['resolved_target']=list(projector.reference(doc,node[keyword]))
            entry['observations']=[r for r in projector.routes if r['document']==doc and
                                   (r['pointer']==ptr+'/'+keyword or r['pointer'].startswith(ptr+'/'+keyword+'/'))]
            routing.append(entry)
    return ledger, entailments, unresolved, invalid, routing


def run_schema():
    documents = dfm.schema_documents()
    fixtures = dfm.integrity_inputs()['fixtures']
    ledger, covered, samples, invalid = [], collections.defaultdict(list), {}, []
    def add_sample(doc, ptr, value):
        key = (doc, ptr)
        if len(samples.setdefault(key, [])) < 6 and not any(dfm.same_value(v, value) for v in samples[key]):
            samples[key].append(copy.deepcopy(value))
    seen = set()
    for row in fixtures['rows']:
        for case in row['boundary_cases']:
            if case.get('scenario') != 'schema-rule':
                continue
            case_id = row['event_type'] + '/' + case['name']
            control, negative = rule_values(row, case)
            definition = case['definition']
            add_sample(case['document'], definition, control)
            expected_phase = dfm.schema_phase(case['document'], definition)
            expected_row = dfm.table_rows(expected_phase)[0][0]
            baseline = outcome(lambda: dfm.boundary_case(row, case))
            accepted = outcome(lambda:dfm.validate_shape(case['document'],definition,control))
            expected = {'status': 'refused', 'phase': expected_phase, 'row': expected_row,
                        'code': 'schema', 'schema': case['expected_schema']}
            entry = {'id': case_id, 'guards': case['guards'], 'expected': expected, 'actual': baseline,
                     'control_outcome':accepted}
            if baseline != expected or accepted!={'status':'accepted'}:
                entry['result'] = 'INVALID'
                invalid.append(entry)
                continue
            # Reuse only identical original document, entry, values, and cut list.
            signature = digest([case['document'], definition, control, negative, case['guards']])
            if signature in seen:
                entry.update(result='EXACT_REFUSAL_ALIAS', proof=signature)
                ledger.append(entry)
                continue
            with schema_cut(documents, case['guards']):
                cut = outcome(lambda: dfm.boundary_case(row, case))
            restored = outcome(lambda: dfm.boundary_case(row, case))
            entry.update(cut=cut, restored=restored, proof=signature,
                         result='COVERED' if credited_trial(accepted,baseline,cut,restored,expected) else 'INVALID')
            (ledger if entry['result'] == 'COVERED' else invalid).append(entry)
            if entry['result'] == 'COVERED':
                seen.add(signature)
                for guard in case['guards']:
                    covered[(guard['document'], guard['pointer'])].append(signature)
    extra, entailments, unresolved, extra_invalid, routing = extend_coverage(documents,fixtures,covered,samples)
    nodes = schema_nodes(documents)
    inventory = []
    for (doc, ptr), node in nodes.items():
        if not isinstance(node, dict):
            continue
        for keyword in node:
            if keyword in g.ANNOTATIONS or keyword == '$defs':
                continue
            members = range(len(node[keyword])) if keyword == 'required' else (None,)
            for member in members:
                clause = ptr + '/' + keyword + ('/' + str(member) if member is not None else '')
                inventory.append({'document': doc, 'pointer': clause, 'keyword': keyword,
                                  'proofs': covered.get((doc, clause), []),
                                  'schema_node': ptr})
    accounted_invalid = all(e['guards']==[{'document':'event_record.schema.json','pointer':'#/properties/schema_id/const'}]
        and e.get('actual',{}).get('schema')=={'validator':'type','path':[]}
        and e.get('control_outcome')=={'status':'accepted'}
        and e.get('cut')==e['actual']==e.get('restored') for e in invalid)
    return {'status': 'pass' if accounted_invalid and not unresolved else 'fail', 'method': 'whole-definition Method B; clause cuts are separate lane evidence',
            'source_sha256': {path: hashlib.sha256((ROOT/'Plans'/path).read_bytes()).hexdigest() for path in documents},
            'ledger': ledger, 'invalid': invalid, 'inventory': inventory,
            'additional_clause_proofs':extra,'entailments':entailments,'unresolved':unresolved,
            'additional_invalid':extra_invalid,
            'routing':routing,
            'accounted_invalid':accounted_invalid,
            'sample_count': len(samples),
            'summary': {'attempts': len(ledger)+len(invalid), 'exact_refusals': len(ledger),
                        'cut_proofs': sum(e['result']=='COVERED' for e in ledger), 'invalid': len(invalid),
                        'additional_clause_proofs':len(extra),'entailments':len(entailments),'unresolved':len(unresolved),
                        'covered_physical_clauses': len(covered), 'physical_clauses': len(inventory)}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    sources={Path(__file__)}
    for module in list(sys.modules.values()):
        filename=getattr(module,'__file__',None)
        if filename:
            path=Path(filename).resolve()
            if path.suffix=='.py' and path.is_relative_to(ROOT/'scripts'):
                sources.add(path)
    sources.update(ROOT/'Plans'/path for path in dfm.schema_documents())
    sources.update(ROOT/path for path in ('Plans/filemanager_event_contract_fixtures.json',
                   'Plans/filemanager_event_p2a_cases.json','Plans/storage_value_registry.json'))
    pins={str(path.relative_to(ROOT)):hashlib.sha256(path.read_bytes()).hexdigest() for path in sorted(sources)}
    result = run_schema()
    assert all(hashlib.sha256((ROOT/path).read_bytes()).hexdigest()==pin for path,pin in pins.items()),'execution sources changed'
    result['execution_source_sha256']=pins
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with gzip.open(args.out, 'wt') as handle:
        json.dump(result, handle, sort_keys=True, indent=1)
        handle.write('\n')
    print(json.dumps({'status': result['status'], **result['summary']}), flush=True)
    return int(result['status'] != 'pass')


if __name__ == '__main__':
    raise SystemExit(main())
