#!/usr/bin/env python3
"""Check 11: remove acceptance guards in memory and replay the lane's negatives.

The ordinary checker is never edited or weakened. JSON Schema keyword mutants
suppress one rule at its exact document/path (required members separately).
Function mutants replace one rejection predicate with its accepting value.
"""
import argparse
import ast
import copy
from dataclasses import dataclass
import hashlib
import importlib.util
import json
from pathlib import Path
from unittest.mock import patch
from jsonschema import Draft202012Validator, FormatChecker, validators

ROOT = Path(__file__).resolve().parents[1]


def changed(value, changes):
    result = copy.deepcopy(value)
    for path, replacement in changes.items():
        target = result
        keys = path.split('.')
        for key in keys[:-1]:
            target = target[int(key)] if isinstance(target,list) else target[key]
        target[int(keys[-1]) if isinstance(target,list) else keys[-1]] = copy.deepcopy(replacement)
    return result


@dataclass
class Case:
    name: str
    surface: str
    args: tuple
    expected: object = False


def corpus(m):
    rows = json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']
    fs = json.loads((ROOT/'Plans/dch_event_contract_fixtures.json').read_text())
    cs = json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text())
    cases = []
    def add(name, surface, *args, expected=False):
        cases.append(Case(name, surface, args, expected))
    for f in fs:
        event, edition, p, r = f['event_type'], f['edition'], f['valid'], f['record']
        row = next(row for row in rows if row['event_type'] == event)
        schema = json.loads((ROOT/row['payload_schema_ref']).read_text())
        prefix = event+'/'+edition+'/'
        add(prefix+'positive', 'payload', schema, p, expected=True)
        for field in f['missing_fields']:
            invalid = copy.deepcopy(f.get('missing_field_bases',{}).get(field,p)); del invalid[field]
            add(prefix+'missing/'+field, 'payload', schema, invalid)
        for name, changes in [('extra_field', {'unexpected': True}), ('wrong_version', {'schema_version': '9.0.0'}),
                              ('scope_mismatch', {'scope.project_id': 'alien' if edition == 'application' else None})]:
            add(prefix+name, 'payload', schema, changed(p, changes))
        if 'exit_code' not in p:
            add(prefix+'fabricated_exit', 'payload', schema, {**p, 'exit_code': 0})
        add(prefix+'envelope_positive', 'joins', r, event, expected=True)
        for key in ['event_type','event_id','idempotency_key','payload_schema_id','scope_kind','project_id',
                    'thread_id','actor_ref','occurred_at_utc','payload_ref','run_id','node_id','attempt_id']:
            if key=='payload_ref':
                reference=next(o for o in f['transport_oracles'] if o['name']=='authorized_payload_reference')
                invalid=copy.deepcopy(reference['record']);parts=invalid['payload_ref'].split(':');parts[2]='c'*64;invalid['payload_ref']=':'.join(parts)
                add(prefix+'envelope/'+key,'joins',invalid,event,reference['source'])
            else:add(prefix+'envelope/'+key, 'joins', {**r, key: 'wrong'}, event)
        for key in ['event_id','idempotency_key']:
            add(prefix+'envelope_lf/'+key, 'joins', {**r, key: r[key]+'\n'}, event)
        for o in f.get('partition_oracles',[]):
            add(prefix+'partition/'+o['name'], 'partition', {**p['scope'], 'project_id':o['project_id'],
                'scope_partition':o['scope_partition']}, expected=o['expected_valid'])
        for o in f['historical_oracles']:
            c = changed({'record':r,'witness':f['historical_source']},o['changes'])
            add(prefix+'history/'+o['name'], 'history', c['record'], row, c['witness'], schema,
                expected=o['expected_valid'])
        for o in f['transport_oracles']:
            add(prefix+'transport/'+o['name'], 'transport', o['record'], event, o.get('source'), schema,
                expected=o['expected_valid'])
        for o in f['retry_oracles']:
            retry=changed(r,{**o.get('record_changes',{}),**{'payload.'+k:v for k,v in o.get('payload_changes',{}).items()}})
            if 'actor_ref' in o.get('payload_changes',{}):retry['actor_ref']=retry['payload']['actor_ref']
            add(prefix+'retry/'+o['name'],'retry',r,retry,o.get('dedupe_available',True),expected=o['expected'])
        for key in m.SEMANTIC_FIELDS:
            retry=copy.deepcopy(r); old=retry[key]
            if key=='payload':retry[key]=m.semantic_body_mutation(r,event)
            elif key=='migration':retry[key]['migration_id']='changed'
            elif key=='producer_sequence_id':retry[key]=7
            elif key=='scope_kind':retry[key]='application' if old=='project' else 'project'
            elif key=='project_id':retry[key]='other_project'
            else:retry[key]='changed' if old is None else str(old)+':changed'
            if key=='actor_ref':retry['payload']['actor_ref']=retry['actor_ref']
            add(prefix+'semantic/'+key,'retry',r,retry,True,expected='conflict')
        add(prefix+'event_id_integrity','retry',r,{**r,'event_id':r['event_id']+'changed'},True,expected='conflict')
        for key,val in [('sequence_id',2),('observed_at_utc','2026-11-04T00:00:01Z'),('persisted_at_utc','2026-11-04T00:00:02Z')]:
            add(prefix+'storage_metadata/'+key,'retry',r,{**r,key:val},True,expected='original_result')
        for policy in ['projector_replay_only','append_once','dedupe_by_event_id']:
            invalid={**r,'replay_policy':policy}
            add(prefix+'append/'+policy,'joins',invalid,event)
            for n,(a,b) in enumerate([(r,invalid),(invalid,r),(invalid,invalid)]):
                add(prefix+'retry_policy/'+policy+'/'+str(n),'retry',a,b,True,
                    expected='replay_only_not_appendable' if policy=='projector_replay_only' else 'invalid_append_policy')
        for size in [m.INLINE_LIMIT,m.INLINE_LIMIT+1]:
            body={'probe':'x'*(size-10)}
            while len(m.body_bytes(body))!=size:
                body['probe']=body['probe']+'x' if len(m.body_bytes(body))<size else body['probe'][:-1]
            add(prefix+'inline/'+str(size),'resolve',{**r,'payload':body},None,expected=size<=m.INLINE_LIMIT)
        if 'test_oracles' in f:
            add(prefix+'test/positive','test',p,f['test_source'],event,schema,expected=True)
            for o in f['test_oracles']:
                c=changed({'payload':p,'source':f['test_source']},o['changes'])
                add(prefix+'test/'+o['name'],'test',c['payload'],c['source'],event,schema,expected=o['expected_valid'])
        if 'archive_oracles' in f:
            add(prefix+'archive/positive','archive',p,f['archive_source'],schema,expected=True)
            for o in f['archive_oracles']:
                c=changed({'payload':p,'source':f['archive_source']},o['changes'])
                add(prefix+'archive/'+o['name'],'archive',c['payload'],c['source'],schema,expected=o['expected_valid'])
        # Additional witnesses cover structural branches and each application
        # scope slot without altering any committed fixture input.
        for field,value in ([('scope_partition','other'),('project_id','other'),('project_home_server_id','other'),('named_plan_id','other')]
                            if edition=='application' else [('scope_kind','unknown'),('scope_partition','Xroject~cDE')]):
            add(prefix+'scope_guard/'+field+'/'+str(value),'partition',{**p['scope'],field:value})
        reference=next(o for o in f['transport_oracles'] if o['name']=='authorized_payload_reference')
        reference_record=copy.deepcopy(reference['record'])
        witness={**copy.deepcopy(f['historical_source']),'source_value_sha256':hashlib.sha256(m.body_bytes(reference_record)).hexdigest(),
                 'payload_source':copy.deepcopy(reference['source'])}
        add(prefix+'history/reference_positive','history',reference_record,row,witness,schema,expected=True)
        add(prefix+'history/reference_unavailable','history',reference_record,row,{**witness,'payload_source':None},schema)
        # These match the ordinary checker's patterned-string LF probes exactly.
        patterns=[]
        def collect(s):
            if isinstance(s,dict):
                if 'pattern' in s:patterns.append(s['pattern'])
                for v in s.values():collect(v)
            elif isinstance(s,list):
                for v in s:collect(v)
        import re
        def leaves(v,path=''):
            if isinstance(v,dict):
                for k,w in v.items():yield from leaves(w,(path+'.'+k).lstrip('.'))
            elif isinstance(v,list):
                for k,w in enumerate(v):yield from leaves(w,path+'.'+str(k))
            else:yield path,v
        collect(schema)
        for path,v in leaves(p):
            if isinstance(v,str) and any(re.search(pattern,v) for pattern in patterns):
                add(prefix+'payload_lf/'+path,'payload',schema,changed(p,{path:v+'\n'}))
    for c in cs:
        event=c['event_type'];prefix=event+'/checkpoint/'
        row=next(r for r in rows if r['event_type']==event)
        schema=json.loads((ROOT/c['schema_ref'].split('#')[0]).read_text())
        for name in ['valid','with_history','maximum_history']:
            add(prefix+name,'checkpoint',c[name],c['source'],row,c['key'],schema,expected=True)
        for name in c['negative_cases']:
            invalid=copy.deepcopy(c['valid'])
            if name=='persisted_redb_snapshot_id':invalid['source_token']['redb_snapshot_id']='forbidden'
            if name=='wrong_consumer':invalid['consumer_id']='sibling'
            if name=='wrong_projector':invalid['projector_id']='sibling'
            if name=='missing_source_token':del invalid['source_token']
            if name=='four_generations':invalid=c['negative_values'][name]
            add(prefix+name,'payload',schema,invalid)
        for o in c['join_oracles']:
            v=changed({'value':c['valid'],'source':c['source'],'key':c['key']},o['changes'])
            add(prefix+'join/'+o['name'],'checkpoint',v['value'],v['source'],row,v['key'],schema,expected=o['expected_valid'])
        missing=copy.deepcopy(c['source']);missing['checkpoint']['generations']={}
        add(prefix+'missing_generation','checkpoint',c['valid'],missing,row,c['key'],schema)
        for name in ['optional','conditional','history','dynamic']:
            broken=copy.deepcopy(schema)
            probe={'$dynamicRef':'#DCH_MISSING'} if name=='dynamic' else {'$ref':'#/$defs/DCH_MISSING'}
            if name=='optional':broken.setdefault('properties',{})['optional_probe']=probe
            elif name=='conditional':broken['allOf']=[{'if':{'const':'unreachable'},'then':probe}]
            elif name=='history':broken['properties']['history']['items']['properties']['source_token']=probe
            else:broken.setdefault('$defs',{})['dynamic_probe']=probe
            add(prefix+'reference_closure/'+name,'references',broken,ROOT/c['schema_ref'].split('#')[0])
        add(prefix+'reference_closure/positive','references',schema,ROOT/c['schema_ref'].split('#')[0],expected=True)
        registered=copy.deepcopy(schema);registered['description']='independently changed registry description'
        add(prefix+'registry_parity','parity',schema,registered)
        add(prefix+'registry_parity_positive','parity',schema,schema,expected=True)
        patterns=[];collect(schema)
        for base in ['valid','with_history','maximum_history']:
            for path,v in leaves(c[base]):
                if isinstance(v,str) and any(re.search(pattern,v) for pattern in patterns):
                    # Lists need a path setter which preserves numeric indices.
                    invalid=copy.deepcopy(c[base]);target=invalid;parts=path.split('.')
                    for k in parts[:-1]:target=target[int(k)] if isinstance(target,list) else target[k]
                    last=parts[-1];target[int(last) if isinstance(target,list) else last]=v+'\n'
                    add(prefix+base+'_lf/'+path,'payload',schema,invalid)
    return cases


class Proof:
    def __init__(self):
        spec=importlib.util.spec_from_file_location('dch_proof_subject',ROOT/'scripts/pm_dch_events.py')
        self.m=importlib.util.module_from_spec(spec);spec.loader.exec_module(self.m)
        self.removed=set();self.seen={};self.aliases={};self.schema_paths={};self.validation_cache={}
        self.schemas={};self.adapters={};self.failures=set();self.current_case=None
        self.m._guard=self.guard
        self.instrument()
        self.m.Draft202012Validator=self.validator
        self.envelope=self.validator(json.loads((ROOT/'Plans/event_record.schema.json').read_text()))
        self.cases=corpus(self.m)
        original_resolve=self.m.resolve_body
        def materialize(record,source=None,storage_instance=self.m.STORAGE_INSTANCE):
            key='transport: original reference materialization'
            if record['payload_ref'] is not None and source is None:
                self.seen.setdefault(key,{'kind':'structural branch'});self.failures.add(key)
                if key in self.removed:
                    positive=next((c for c in self.cases if c.surface=='transport' and c.expected is True and c.args[0]['event_id']==record['event_id']),None)
                    if positive:source=positive.args[2]
            return original_resolve(record,source,storage_instance)
        self.m.resolve_body=materialize
    def guard(self,key,value,accept):
        key=self.group(key)
        self.seen.setdefault(key,{'kind':'function','accepting_value':accept})
        if value!=accept:self.failures.add(key)
        return accept if key in self.removed else value
    def group(self,key):
        import re
        function_groups={
            "archive_joins: payload['archive_origin'] == 'manual'":'archive: manual payload origin',
            "archive_joins: payload['command_id'] == 'cmd.chat.archive'":'archive: original command',
            "archive_joins: before['state'] in ['active', 'suspended']":'archive: allowed predecessor',
            "test_joins: outcome['exit_code'] != 0":'test: failed exit is nonzero',
            "test_joins: outcome['exit_code'] is None":'test: nonexit has no exit code',
            "test_joins: outcome['kind'] != 'process_error' or payload['error_ref'] is not None":'test: process error requires evidence',
            "test_joins: payload['error_ref'] is None":'test: ordinary exit has no process error',
            "test_joins: outcome['kind'] in ['timeout', 'process_error']":'test: supported failure outcome',
            "test_joins: type(outcome['exit_code']) is int":'test: exit code type',
            "checkpoint_joins: value['consumer_id'] == row['reader']":'checkpoint: consumer identity',
            "checkpoint_joins: value['projector_id'] == row['domain_projector']":'checkpoint: projector identity',
        }
        if key in function_groups:return function_groups[key]
        if key.startswith('schema: '):
            if 'pm.storage_value.dch_' in key and '/history/' not in key:
                if key.endswith('/properties/consumer_id/const'):return 'checkpoint: consumer identity'
                if key.endswith('/properties/projector_id/const'):return 'checkpoint: projector identity'
            if 'pm.dch_event.chat_thread_archived.schema.v1#' in key:
                if re.search(r'/properties/archive_origin/const$',key):return 'archive: manual payload origin'
                if re.search(r'/properties/command_id/const$',key):return 'archive: original command'
                if re.search(r'/properties/previous_state/enum$',key):return 'archive: allowed predecessor'
            if 'pm.dch_event.chat_thread_worktree_pre_merge_test_failed.schema.v1#' in key:
                if '/properties/exit_code/' in key and key.endswith('/not'):return 'test: failed exit is nonzero'
                if '/properties/test_outcome/enum' in key:return 'test: supported failure outcome'
                if '/properties/exit_code/' in key and key.endswith('/type'):return 'test: exit code type'
                if '/allOf/0/else/properties/exit_code/const' in key:return 'test: nonexit has no exit code'
                if '/allOf/1/then/properties/error_ref/type' in key:return 'test: process error requires evidence'
                if '/allOf/0/then/properties/error_ref/const' in key:return 'test: ordinary exit has no process error'
            key=re.sub(r'#/(?:\$defs/(?:project|application)/)?additionalProperties$', '#/closed_payload', key)
        return self.aliases.get(key,key)

    def instrument(self):
        tree=ast.parse((ROOT/'scripts/pm_dch_events.py').read_text())
        target={'historical_read_valid','resolve_body','joins','test_joins','checkpoint_joins','archive_joins'}
        proof=self
        class Wrap(ast.NodeTransformer):
            def __init__(self,name):self.name=name
            def atom(self,n,accept):
                if isinstance(n,ast.BoolOp) and ((accept and isinstance(n.op,ast.And)) or (not accept and isinstance(n.op,ast.Or))):
                    n.values=[self.atom(v,accept) for v in n.values];return n
                # Delegation and materialization null checks duplicate the
                # underlying boundary, rather than introduce an independent rule.
                text=ast.unparse(n)
                if text.startswith(('joins(', 'valid_scope_partition(')) or text in ['body is None','p is None','not node','not source']:
                    return n
                key=self.name+': '+text
                return ast.copy_location(ast.Call(ast.Name('_guard',ast.Load()),[ast.Constant(key),n,ast.Constant(accept)],[]),n)
            def visit_If(self,n):
                if self.name=='checkpoint_joins' and ast.unparse(n.test)=='not node':
                    n.body=[ast.Return(ast.Call(ast.Name('_guard',ast.Load()),[ast.Constant('checkpoint: source generation exists'),ast.Constant(False),ast.Constant(True)],[]))]
                    return n
                if len(n.body)==1 and isinstance(n.body[0],ast.Return) and isinstance(n.body[0].value,ast.Constant) and n.body[0].value.value in [False,None]:
                    n.test=self.atom(n.test,False)
                n.body=[self.visit(v) for v in n.body];n.orelse=[self.visit(v) for v in n.orelse];return n
            def visit_Return(self,n):
                if isinstance(n.value,ast.BoolOp) and isinstance(n.value.op,ast.And):n.value=self.atom(n.value,True)
                elif self.name=='resolve_body' and isinstance(n.value,ast.IfExp):n.value.test=self.atom(n.value.test,True)
                return n
        for n in tree.body:
            if isinstance(n,ast.FunctionDef) and n.name in target:
                n=Wrap(n.name).visit(n);ast.fix_missing_locations(n)
                exec(compile(ast.Module([n],type_ignores=[]),str(ROOT/'scripts/pm_dch_events.py'),'exec'),self.m.__dict__)
    def validator(self,schema,**kwargs):
        signature=json.dumps(schema,sort_keys=True)
        if signature in self.adapters:return self.adapters[signature]
        if signature not in self.schemas:
            canonical=copy.deepcopy(schema);doc=canonical.get('$id','anonymous:'+hashlib.sha256(signature.encode()).hexdigest())
            def walk(v,path=''):
                if isinstance(v,dict):
                    self.schema_paths[id(v)]=(doc,path)
                    if 'pattern' in v:
                        for keyword in ['pattern','minLength','maxLength']:
                            self.aliases['schema: '+doc+'#'+path+'/'+keyword]='schema: '+doc+'#'+path+'/identifier_shape'
                        if 'format' in v:self.aliases['schema: '+doc+'#'+path+'/format']='schema: '+doc+'#'+path+'/identifier_shape'
                    for k,w in v.items():walk(w,path+'/'+k)
                elif isinstance(v,list):
                    for k,w in enumerate(v):walk(w,path+'/'+str(k))
            walk(canonical)
            self.schemas[signature]=canonical
        canonical=self.schemas[signature];proof=self
        handlers={}
        for keyword,handler in Draft202012Validator.VALIDATORS.items():
            if keyword in ['oneOf','anyOf','allOf','if','then','else','properties','items','$ref','$dynamicRef','dependentSchemas']:
                continue
            def wrapped(v,rule,instance,fragment,keyword=keyword,handler=handler):
                for error in handler(v,rule,instance,fragment):
                    doc,path=proof.schema_paths[id(fragment)]
                    member=''
                    if keyword=='required':
                        member='/'+next(k for k in rule if k not in instance and error.message==repr(k)+' is a required property')
                    key=proof.group('schema: '+doc+'#'+path+'/'+keyword+member)
                    # Failed non-selected editions are ordinary oneOf probing,
                    # not guards on this instance's selected edition.
                    edition=getattr(proof,'edition',None)
                    relevant=not (('/$defs/project' in path and edition=='application') or ('/$defs/application' in path and edition=='project'))
                    if relevant:
                        pass
                    error._dch_key=key;error._dch_relevant=relevant
                    if key not in proof.removed:yield error
            handlers[keyword]=wrapped
        V=validators.extend(Draft202012Validator,handlers)
        actual=V(canonical,format_checker=FormatChecker())
        class Adapter:
            def is_valid(self,value):
                old=getattr(proof,'edition',None)
                if isinstance(value,dict):
                    if isinstance(value.get('scope'),dict):proof.edition=value['scope']['scope_kind']
                    elif '.project.v1' in value.get('schema_id',''):proof.edition='project'
                    elif '.application.v1' in value.get('schema_id',''):proof.edition='application'
                    elif proof.current_case and proof.current_case.split('/')[1] in ['project','application']:proof.edition=proof.current_case.split('/')[1]
                try:
                    errors=list(actual.iter_errors(value))
                    def record(error):
                        if error.context:
                            for child in error.context:record(child)
                        elif getattr(error,'_dch_relevant',False):
                            key=error._dch_key
                            proof.seen.setdefault(key,{'kind':'schema'})
                            proof.failures.add(key)
                    for error in errors:record(error)
                    return not errors
                finally:proof.edition=old
        adapter=Adapter();self.adapters[signature]=adapter;return adapter
    def evaluate(self,c):
        m=self.m;a=c.args;s=c.surface;self.failures=set();self.current_case=c.name
        if s in ['references','parity']:
            key='schema: complete reference graph' if s=='references' else 'checkpoint: selected/registered schema parity'
            self.seen.setdefault(key,{'kind':'preflight'})
            with patch.object(m,'Draft202012Validator',Draft202012Validator):
                valid=not m.schema_reference_errors(*a) if s=='references' else a[0]==a[1]
            if not valid:self.failures.add(key)
            return True if key in self.removed else valid
        if s=='payload':return self.validator(a[0]).is_valid(a[1])
        if s=='partition':
            key='scope: exact canonical CV-365 partition'
            self.seen.setdefault(key,{'kind':'function'})
            result=m.valid_scope_partition(*a)
            if not result:self.failures.add(key)
            return True if key in self.removed else result
        if s=='joins':return m.joins(*a)
        if s=='resolve':return m.resolve_body(*a) is not None
        if s=='retry':
            original,retry,available=a;retry=copy.deepcopy(retry);original=copy.deepcopy(original)
            policy='retry: current append policy';dedupe='retry: authoritative dedupe available';event_id='retry: original event identity'
            if any(r['replay_policy']!='dedupe_by_idempotency_key' for r in [original,retry]):
                self.failures.add(policy);self.seen.setdefault(policy,{'kind':'function'})
            if not available:self.failures.add(dedupe);self.seen.setdefault(dedupe,{'kind':'function'})
            if original['event_id']!=retry['event_id']:self.failures.add(event_id);self.seen.setdefault(event_id,{'kind':'function'})
            for field in m.SEMANTIC_FIELDS:
                key='retry: semantic/'+field
                left,right=original[field],retry[field]
                if field=='payload':
                    left={k:v for k,v in left.items() if k!='actor_ref'};right={k:v for k,v in right.items() if k!='actor_ref'}
                if left!=right:self.failures.add(key);self.seen.setdefault(key,{'kind':'function'})
                if key in self.removed:
                    actor=retry['payload'].get('actor_ref')
                    retry[field]=copy.deepcopy(original[field])
                    if field=='payload':retry['payload']['actor_ref']=actor
                    if field=='actor_ref' and 'actor_ref' in retry['payload']:retry['payload']['actor_ref']=original['payload']['actor_ref']
            if policy in self.removed:original['replay_policy']=retry['replay_policy']='dedupe_by_idempotency_key'
            if dedupe in self.removed:available=True
            if event_id in self.removed:retry['event_id']=original['event_id']
            return m.retry_outcome(original,retry,available)
        if s=='history':return m.historical_read_valid(a[0],a[1],a[2],self.envelope,self.validator(a[3]))
        if s=='transport':
            r,e,src,schema=a
            b=m.resolve_body(r,src)
            return self.envelope.is_valid(r) and m.joins(r,e,src) and b is not None and self.validator(schema).is_valid(b)
        if s=='test':return self.validator(a[3]).is_valid(a[0]) and m.test_joins(*a[:3])
        if s=='archive':return self.validator(a[2]).is_valid(a[0]) and m.archive_joins(*a[:2])
        if s=='checkpoint':return self.validator(a[4]).is_valid(a[0]) and m.checkpoint_joins(*a[:4])
        raise ValueError(s)
    def run(self,out):
        baseline=[];traces={}
        for c in self.cases:
            result=self.evaluate(c)
            if result!=c.expected:baseline.append({'case':c.name,'expected':c.expected,'actual':result})
            traces[c.name]=sorted(self.failures)
        if baseline:raise AssertionError(baseline)
        keys=list(self.seen);rows=[];coverage={c.name:[] for c in self.cases if (c.expected is False or c.expected in ['conflict','dedupe_unavailable','replay_only_not_appendable','invalid_append_policy'])}
        for key in keys:
            # Only cases that reached this guard can possibly change. Replaying
            # the others yields their cached baseline (all other guards restored).
            affected=[c for c in self.cases if key in traces[c.name]]
            self.removed={key};flips=[];errors=[]
            for c in affected:
                try:
                    actual=self.evaluate(c)
                    if (c.expected is False and actual is True) or (c.expected in ['conflict','dedupe_unavailable','replay_only_not_appendable','invalid_append_policy'] and actual=='original_result'):flips.append(c.name)
                except Exception as exc:errors.append({'case':c.name,'exception':repr(exc)})
            self.removed=set()
            for name in flips:
                if name in coverage:coverage[name].append(key)
            rows.append({'guard':key,**self.seen[key],'negatives_that_flip':flips,
                         'other_negatives_stay_rejected':len(coverage)-sum(name in coverage for name in flips),
                         'exceptions':errors})
        report={'method':'Direct acceptance corpus; real function AST accepting-value substitutions and exact schema-keyword variants. Equivalent copies of one rule are grouped; unrelated rules remain enforced. Unreached guards reuse the deterministic baseline; every reached failing guard is reevaluated. All guards are restored per row.',
                'status':'pass' if all(coverage.values()) and all(r['negatives_that_flip'] for r in rows) and not any(r['exceptions'] for r in rows) else 'fail',
                'cases':len(self.cases),'negative_cases':len(coverage),'guards':len(rows),
                'unproved_negatives':[n for n,gs in coverage.items() if not gs],
                'guards_without_flips':[r['guard'] for r in rows if not r['negatives_that_flip']],
                'table':rows,'negative_guards':coverage,'baseline_traces':traces}
        out.write_text(json.dumps(report,indent=2)+'\n')
        print(json.dumps({k:v for k,v in report.items() if k not in ['table','negative_guards','baseline_traces']},indent=2))
        return report['status']!='pass'


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--out',type=Path,required=True);args=p.parse_args()
    return Proof().run(args.out)


if __name__=='__main__':raise SystemExit(main())
