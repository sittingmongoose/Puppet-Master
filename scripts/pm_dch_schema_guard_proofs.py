#!/usr/bin/env python3
"""Construct isolated witnesses for every declared DCH schema constraint.

Candidates are exploration, not evidence. The parent retains a candidate only
when removing its own guard makes it accepted; all committed fixture negatives
remain mandatory. Nullable primitive alternatives are normalized equivalently
so deleting a union arm cannot accidentally delete its sibling's constraints.
"""
import copy
import json
import re
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker

REBUILD=False
FIXTURE=Path(__file__).resolve().parents[1]/'Plans/dch_schema_guard_fixtures.json'

def contract_drift(expected,current):
    return sorted(key for key in expected.keys()|current.keys() if key not in expected or key not in current or expected[key]!=current[key])

class SchemaContractDrift(Exception):
    def __init__(self,details):self.details=details

def raw_contract(schema):
    rules={};doc=schema['$id']
    def walk(node,path=''):
        if isinstance(node,list):
            for i,v in enumerate(node):walk(v,path+'/'+str(i))
        elif isinstance(node,dict):
            unsupported=(set(node)&set(Draft202012Validator.VALIDATORS))-KEYWORDS-COMBINATORS
            if unsupported:raise SchemaContractDrift({'unsupported_schema_keyword':[doc+'#'+path+'/'+key for key in sorted(unsupported)]})
            if '/if/' not in path and not path.endswith('/if') and '/not' not in path:
                for keyword in KEYWORDS & node.keys():
                    if keyword=='additionalProperties' and node[keyword] is not False:continue
                    if keyword=='required':
                        for member in node[keyword]:rules[doc+'#'+path+'/required/'+member]=True
                    else:rules[doc+'#'+path+'/'+keyword]=copy.deepcopy(node[keyword])
            for k,v in node.items():walk(v,path+'/'+k)
    walk(schema);return rules

def write_fixtures(proof,report):
    names=set(report['negative_guards']);cases=[]
    for c in proof.cases:
        if c.name in names and hasattr(c,'schema_guard_change'):
            cases.append({'name':c.name,'base_case':c.schema_guard_base,'change':c.schema_guard_change})
    data={'schema_id':'pm.dch.schema_guard_fixtures.v1','authority':'Static test oracle; owner Plans and selected schemas remain product authority. Never rebuild this file to excuse a schema regression.',
          'schema_rules':{key:proof.schema_rules[key] for key in sorted(proof.schema_rules)},'negative_cases':cases}
    FIXTURE.write_text(json.dumps(data,indent=2)+'\n')

COMBINATORS={'$ref','$dynamicRef','properties','items','allOf','anyOf','oneOf','if','then','else'}

KEYWORDS={'type','const','enum','pattern','format','minLength','maxLength',
          'minimum','maximum','minItems','maxItems','uniqueItems','additionalProperties','required','not'}


def normalize(schema):
    def visit(v):
        if isinstance(v,list):return [visit(x) for x in v]
        if not isinstance(v,dict):return v
        v={k:visit(x) for k,x in v.items()}
        if 'oneOf' in v and '$defs' in v:
            refs=[x.get('$ref','') for x in v['oneOf']]
            if refs==['#/$defs/project','#/$defs/application']:
                variants=[v['$defs'][name] for name in ['project','application']]
                tags=[x['properties']['schema_id']['const'] for x in variants]
                assert tags[0]!=tags[1] and all('schema_id' in x['required'] for x in variants)
                v['anyOf']=v.pop('oneOf')
        alternatives=v.get('anyOf')
        if isinstance(alternatives,list) and len(alternatives)==2:
            null=next((x for x in alternatives if x=={'type':'null'}),None)
            other=next((x for x in alternatives if x!=null),None)
            safe={'type','minLength','maxLength','pattern','format','minimum','maximum'}
            if null is not None and other and other.get('type') in ['string','integer','number'] and set(other)<=safe:
                v.pop('anyOf');v.update(other);v['type']=[other['type'],'null']
        return v
    return visit(schema)


def aliases(proof,doc,path,node):
    if not doc.startswith(('pm.dch_event.','pm.storage_value.dch_')):return
    scope_prefix=path.split('/properties/scope/',1)[0]+'/properties/scope'
    if '/properties/scope/' in path:
        unreachable=('/$defs/project/' in path and '/scope/allOf/0/then/' in path) or ('/$defs/application/' in path and '/scope/allOf/0/else/' in path)
        if unreachable:
            for keyword in KEYWORDS-{'required'}:
                if keyword in node:proof.aliases['schema: '+doc+'#'+path+'/'+keyword]='schema: '+doc+'#'+scope_prefix+'/properties/scope_kind/edition_tag'
            return
    if path in ['', '/$defs/project', '/$defs/application'] and 'type' in node and doc.startswith('pm.dch_event.'):
        proof.aliases['schema: '+doc+'#'+path+'/type']='schema: '+doc+'#/object_type'
    # Conditional copies constrain the same scope field, not independent copies
    # of a value. Both primitive nullability and edition constraints remain.
    logical=re.sub(r'/allOf/\d+(?:/(?:then|else))+/(?=properties/)', '/', path)
    logical=re.sub(r'/allOf/\d+/(?=properties/)', '/', logical)
    # The failed-test base and its exit-selected branch constrain the exact
    # same exit_code. Remove their identical bounds as a named duplicate set.
    if 'chat_thread_worktree_pre_merge_test_failed' in doc and logical.endswith('/properties/exit_code'):
        for keyword in ['minimum','maximum']:
            if keyword in node:proof.aliases['schema: '+doc+'#'+path+'/'+keyword]='schema: '+doc+'#'+logical+'/'+keyword
    if '/properties/scope/' in path:
        for keyword in KEYWORDS-{'required'}:
            if keyword in node:proof.aliases['schema: '+doc+'#'+path+'/'+keyword]='schema: '+doc+'#'+logical+'/'+keyword
        field=logical.rsplit('/properties/',1)[-1]
        application='/$defs/application/' in path
        if application and field in ['project_id','project_home_server_id','named_plan_id','scope_partition']:
            for keyword in KEYWORDS-{'required'}:
                if keyword in node:proof.aliases['schema: '+doc+'#'+path+'/'+keyword]='schema: '+doc+'#'+logical+'/application_value'
            return
        if field=='scope_kind':
            for keyword in ['type','enum','const']:
                if keyword in node:proof.aliases['schema: '+doc+'#'+path+'/'+keyword]='schema: '+doc+'#'+logical+'/edition_tag'
            return
    if 'const' in node or 'enum' in node:
        for keyword in ['const','enum','type','minLength','maxLength','pattern','format','minimum','maximum']:
            if keyword in node:proof.aliases['schema: '+doc+'#'+path+'/'+keyword]='schema: '+doc+'#'+logical+'/allowed_value'
    # A pattern may be in the conditional copy while lengths are on the base.
    if '/properties/scope/' in path and logical.endswith('/scope_partition') and '/$defs/project/' in path:
        for keyword in ['pattern','minLength','maxLength']:
            if keyword in node:proof.aliases['schema: '+doc+'#'+path+'/'+keyword]='schema: '+doc+'#'+logical+'/identifier_shape'


def generate(proof,Case):
    additions=[]
    for c in proof.cases:
        if c.surface=='checkpoint' and c.name.endswith('/maximum_history'):
            value,source,row,key,schema=copy.deepcopy(c.args)
            value['projection_refs']=['pmref:fixture:projection_current']
            source['publication']['projection_refs']=list(value['projection_refs'])
            for i,retired in enumerate(value['history']):retired['projection_refs']=['pmref:fixture:projection_retired_'+str(i)]
            additions.append(Case(c.name+'/projection_refs_positive','checkpoint',(value,source,row,key,schema),True))
    proof.cases.extend(additions)
    mandatory=list(proof.cases);extra=[];inventory=set();counter=0
    roots={};rules={}
    frozen=None
    if not REBUILD:
        if not FIXTURE.exists():raise SchemaContractDrift({'missing_fixture':str(FIXTURE)})
        frozen=json.loads(FIXTURE.read_text())
    for c in mandatory:
        if c.surface=='payload' and c.expected is True:
            roots.setdefault(json.dumps(c.args[0],sort_keys=True),[]).append((c.name,c.args[0],c.args[1]))
        elif c.surface=='checkpoint' and c.expected is True:
            roots.setdefault(json.dumps(c.args[4],sort_keys=True),[]).append((c.name,c.args[4],c.args[0]))
        elif c.surface=='test' and c.expected is True:
            roots.setdefault(json.dumps(c.args[3],sort_keys=True),[]).append((c.name,c.args[3],c.args[0]))
        elif c.surface=='archive' and c.expected is True:
            roots.setdefault(json.dumps(c.args[2],sort_keys=True),[]).append((c.name,c.args[2],c.args[0]))
        elif c.surface=='transport' and c.expected is True and c.args[2]:
            roots.setdefault(json.dumps(c.args[3],sort_keys=True),[]).append((c.name,c.args[3],c.args[2]['body']))
    def set_at(value,path,replacement,delete=False):
        result=copy.deepcopy(value)
        if not path:return replacement
        target=result
        for key in path[:-1]:target=target[key]
        if delete:del target[path[-1]]
        else:target[path[-1]]=copy.deepcopy(replacement)
        return result
    def ref(root,pointer):
        value=root
        for key in pointer[2:].split('/'):
            value=value[key.replace('~1','/').replace('~0','~')]
        return value
    for samples in roots.values():
        name,raw,_=samples[0]
        if not raw.get('$id','').startswith(('pm.dch_event.','pm.storage_value.dch_')):continue
        # Register aliases/inventory from the same canonical tree used by the
        # parent's keyword handlers. All editions and retired-item rules count.
        proof.validator(raw)
        canonical=proof.schemas[json.dumps(raw,sort_keys=True)]
        doc=canonical['$id'];rules.update(raw_contract(raw))
        def declared(node,path=''):
            if isinstance(node,dict):
                if '/if/' not in path and not path.endswith('/if') and '/not' not in path:
                    for keyword in KEYWORDS & node.keys():
                        if keyword=='required':
                            for member in node[keyword]:inventory.add(proof.group('schema: '+doc+'#'+path+'/required/'+member))
                        elif keyword!='additionalProperties' or node[keyword] is False:
                            inventory.add(proof.group('schema: '+doc+'#'+path+'/'+keyword))
                for k,v in node.items():declared(v,path+'/'+k)
            elif isinstance(node,list):
                for i,v in enumerate(node):declared(v,path+'/'+str(i))
        declared(canonical)
        if frozen is not None:continue
        for base_index,(name,raw,base) in enumerate(samples):
            ordinary=Draft202012Validator(raw,format_checker=FormatChecker())
            assert ordinary.is_valid(base),name
            seen_candidates=set()
            def add(path,value,label,delete=False):
                nonlocal counter
                candidate=set_at(base,path,value,delete)
                signature=json.dumps(candidate,sort_keys=True)
                if signature in seen_candidates:return
                seen_candidates.add(signature)
                if ordinary.is_valid(candidate):return
                counter+=1
                case=Case(name+'/declared/'+str(base_index)+'/'+'.'.join(map(str,path))+'/'+label,'payload',(raw,candidate),False)
                case.schema_guard_base=name
                case.schema_guard_change={'path':list(path),'delete':delete}
                if not delete:case.schema_guard_change['value']=copy.deepcopy(value)
                extra.append(case)
            def walk(value,node,path=(),schema_path=''):
                if '$ref' in node:
                    walk(value,ref(canonical,node['$ref']),path,node['$ref'][1:]);return
                if 'oneOf' in node or ('anyOf' in node and '$defs' in node):
                    edition=base.get('scope',{}).get('scope_kind')
                    selected=canonical['$defs'].get(edition)
                    if selected is not None:walk(value,selected,path,'/$defs/'+edition)
                if not isinstance(node,dict):return
                if isinstance(value,dict):
                    if node.get('additionalProperties') is False:add(path,{**value,'DCH_UNEXPECTED':True},'additionalProperties')
                    for field in node.get('required',[]):
                        if field in value:add(path+(field,),None,'required',True)
                    for field,child in node.get('properties',{}).items():
                        if field in value:walk(value[field],child,path+(field,),schema_path+'/properties/'+field)
                if isinstance(value,list):
                    if node.get('uniqueItems') and value:add(path,[value[0],value[0]],'uniqueItems')
                    if 'minItems' in node:add(path,value[:max(0,node['minItems']-1)],'minItems')
                    if 'maxItems' in node and (not value or isinstance(value[0],str)):
                        seed=value[0] if value else 'pmref:fixture:guard'
                        add(path,[seed+':guard'+str(i) for i in range(node['maxItems']+1)],'maxItems')
                    if value and isinstance(node.get('items'),dict):walk(value[0],node['items'],path+(0,),schema_path+'/items')
                if 'type' in node:
                    choices=node['type'] if isinstance(node['type'],list) else [node['type']]
                    candidate=1.5 if 'string' in choices or 'integer' in choices else 'DCH_WRONG_TYPE'
                    add(path,candidate,'type')
                if 'const' in node:
                    v=node['const'];candidate='DCH_OTHER' if isinstance(v,str) or v is None else not v if isinstance(v,bool) else 999
                    add(path,candidate,'const')
                if 'enum' in node:add(path,'DCH_UNLISTED','enum')
                if 'pattern' in node:add(path,(value if isinstance(value,str) else '')+'\n','pattern')
                if 'format' in node:add(path,(value if isinstance(value,str) else 'invalid')+'\n','format')
                if 'minLength' in node:add(path,'x'*max(0,node['minLength']-1),'minLength')
                if 'maxLength' in node:
                    seed=value if isinstance(value,str) and value else 'x';size=node['maxLength']+1
                    add(path,(seed*((size//len(seed))+1))[:size],'maxLength')
                if 'minimum' in node:add(path,node['minimum']-1,'minimum')
                if 'maximum' in node:add(path,node['maximum']+1,'maximum')
                if 'not' in node and node['not']=={'const':0}:add(path,0,'not')
                for i,clause in enumerate(node.get('allOf',[])):
                    if 'if' in clause:
                        branch='then' if Draft202012Validator(clause['if']).is_valid(value) else 'else'
                        chosen=clause.get(branch,{})
                        walk(value,chosen,path,schema_path+'/allOf/'+str(i)+'/'+branch)
                        # Presence-gated dispatch contains the original if.
                        if 'if' in chosen:
                            inner='then' if Draft202012Validator(chosen['if']).is_valid(value) else 'else'
                            walk(value,chosen.get(inner,{}),path,schema_path+'/allOf/'+str(i)+'/'+branch+'/'+inner)
                    else:walk(value,clause,path,schema_path+'/allOf/'+str(i))
            walk(base,canonical)
    proof.schema_rules=rules
    if frozen is not None:
        expected=frozen['schema_rules']
        if proof.m.SELECTED_FAMILY is not None:
            docs={key.split('#',1)[0] for key in rules}
            expected={k:v for k,v in expected.items() if k.split('#',1)[0] in docs}
        delta=contract_drift(expected,rules)
        if delta:raise SchemaContractDrift({'schema_rule_drift':sorted(delta)})
        bases={name:(schema,body) for samples in roots.values() for name,schema,body in samples}
        for oracle in frozen['negative_cases']:
            if oracle['base_case'] not in bases:continue
            schema,base=bases[oracle['base_case']];change=oracle['change']
            value=set_at(base,tuple(change['path']),change.get('value'),change['delete'])
            extra.append(Case(oracle['name'],'payload',(schema,value),False))
    proof.cases.extend(extra)
    null_key=next(key for key,value in rules.items() if value is None)
    absent=dict(rules);del absent[null_key]
    changed=dict(rules);changed[null_key]='DCH_CHANGED_NULL'
    added=dict(rules);added['pm.dch.guard.extra#/properties/guard/type']='string'
    for name,current,expected_valid in [('unchanged',rules,True),('deleted_null',absent,False),('changed_value',changed,False),('added_rule',added,False)]:
        proof.cases.append(Case('schema_guard_contract/'+name,'schema_contract',(rules,current),expected_valid))
    sample=next(c.args[4] for c in proof.cases if c.surface=='checkpoint')
    unsupported=copy.deepcopy(sample);unsupported['properties']['revision']['exclusiveMaximum']=50
    proof.cases.append(Case('schema_guard_coverage/known','schema_coverage',(sample,),True))
    proof.cases.append(Case('schema_guard_coverage/unsupported','schema_coverage',(unsupported,),False))
    proof.declared_inventory=inventory
    proof.exploration_names={c.name for c in extra} if REBUILD else set()
    return {'mode':'rebuild' if REBUILD else 'frozen','fixture_negative_cases':len(extra),'declared_guards':len(inventory),'raw_schema_constraints':len(rules)}
