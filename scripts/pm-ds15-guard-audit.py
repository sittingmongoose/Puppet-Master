#!/usr/bin/env python3
"""Audit DS15 guard sensitivity over semantic, predicate and value/migration cases.

Source mutations exist only in memory. A refusal, exception, or successful
positive control never counts as detecting a removed guard. A partial audit
exits 1; its full table preserves uncovered cases instead of claiming PASS.
Schema keyword/closure and pattern-specific mutations are separate evidence.
"""
import ast,copy,hashlib,json,pathlib,time,sys,types
from functools import lru_cache
import argparse
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--inventory',action='store_true',help='Print exact AST guard inventory, without executing or mutating any guard')
parser.add_argument('--out',type=pathlib.Path,required=True,help='Raw audit JSON outside the repository')
args=parser.parse_args()
R=pathlib.Path(__file__).resolve().parents[1];O=args.out.parent
if args.out.resolve().is_relative_to(R):
 parser.error('--out must be outside the repository (raw-evidence disk rule)')
O.mkdir(parents=True,exist_ok=True)
source=(R/'scripts/pm-ds15-event-contracts.py').read_text()
m=types.ModuleType('ds15_guard_review');m.__file__=str(R/'scripts/pm-ds15-event-contracts.py');exec(compile(source,m.__file__,'exec'),m.__dict__)
# Snapshot each input on first read; no fixture is edited during this audit.
input_hashes={}
@lru_cache(maxsize=None)
def pinned_read(path):
 data=(R/path).read_bytes();input_hashes[path]=hashlib.sha256(data).hexdigest()
 return json.loads(data)
m.read=pinned_read
# Cache lookup avoids repeatedly serializing immutable shared schemas. Every
# cached object is the exact original validator; no validation is bypassed.
original_validator=m.validator
fast_validators={}
class CachedValidation:
 def __init__(self,original):
  self.original=original;self.results={}
 def iter_errors(self,instance):
  # Every corpus input is immutable. Retaining it prevents id reuse; the
  # returned errors are those of the original validator, without filtering.
  key=id(instance)
  if key not in self.results:
   self.results[key]=(instance,list(self.original.iter_errors(instance)))
  return iter(self.results[key][1])
def fast_validator(schema):
 # Preserve the full wrapper and the identity of its immutable definitions.
 # Retain every schema object so Python cannot recycle an object-id key.
 if '$ref' in schema:
  key=('reference',id(schema.get('$defs')),json.dumps({k:v for k,v in schema.items() if k!='$defs'},sort_keys=True))
 else:key=('resource',id(schema))
 if key not in fast_validators:
  fast_validators[key]=(schema,json.dumps(schema,sort_keys=True),CachedValidation(original_validator(schema)))
 return fast_validators[key][2]
m.validator=fast_validator
# Cache regression: equal refs/definitions with different wrapper constraints
# are different validators; no keyword may disappear from the cache key.
cache_defs={'value':{'type':'string'}}
assert not list(fast_validator({'$ref':'#/$defs/value','$defs':cache_defs,'maxLength':3}).iter_errors('ab'))
assert list(fast_validator({'$ref':'#/$defs/value','$defs':cache_defs,'maxLength':1}).iter_errors('ab'))
cs=m.read('Plans/ds15_event_contracts.json');fs=m.read('Plans/ds15_event_contract_fixtures.json');tree=ast.parse(source)
names={'original_evidence_ok','admission_numbers_ok','index_inputs_ok','checkpoint_value_ok','identity','commitment','identity_fields_types_ok','browser_source_ok','context_types_ok','authority_types_ok','envelope_ok','receipt_ok','token_matches_storage','payload_ok','evaluate','value_valid','migrate'}
presence_helpers={'object_input_present','browser_record_bytes_present','application_source_present','original_output_present','outcome_present','admission_present'}
helpers={x.name:x for x in tree.body if isinstance(x,ast.FunctionDef) and x.name in presence_helpers}
functions=[x for x in tree.body if isinstance(x,ast.FunctionDef) and x.name in names]
mutations=[]
def fingerprint(node):
 return (type(node).__name__,node.lineno,node.col_offset,node.end_lineno,node.end_col_offset,ast.dump(node,include_attributes=False))
def add(function,node,replacement,label):
 call_site=None
 if isinstance(node,ast.UnaryOp) and isinstance(node.op,ast.Not) and isinstance(node.operand,ast.Call) and isinstance(node.operand.func,ast.Name) and node.operand.func.id in presence_helpers:
  # The call is a delegation to this exact predicate, not a second guard.
  # Mutating the implementation also reaches its direct presence boundary.
  call_site={'function':function,'line':node.lineno,'guard':ast.unparse(node)}
  function=node.operand.func.id;node=helpers[function].body[0].value;replacement=True
 mutations.append({'function':function,'line':node.lineno,'column':node.col_offset,'end_line':node.end_lineno,'end_column':node.end_col_offset,'kind':type(node).__name__,'guard':ast.unparse(node),'ast_dump':ast.dump(node,include_attributes=False),'replacement':replacement,'label':label,'call_site':call_site})
def reject(r):
 if not isinstance(r,ast.Return):return False
 if isinstance(r.value,ast.Constant):return r.value.value is False or r.value.value is None
 if isinstance(r.value,ast.Dict):
  def negative(v):
   return (isinstance(v,ast.Constant) and v.value in {'REFUSE','UNAVAILABLE','PENDING'} or
           isinstance(v,ast.IfExp) and negative(v.body) and negative(v.orelse))
  return any(isinstance(k,ast.Constant) and k.value=='result' and negative(v) for k,v in zip(r.value.keys,r.value.values))
 return False
for f in functions:
 for node in ast.walk(f):
  if isinstance(node,ast.If) and len(node.body)==1 and reject(node.body[0]):
   # Each disjunct of a rejection predicate is a separate guard. Simple or
   # conjunctive predicates are disabled as a single gate.
   for p in (node.test.values if isinstance(node.test,ast.BoolOp) and isinstance(node.test.op,ast.Or) else [node.test]):add(f.name,p,False,'reject-condition')
  if f.name not in {'evaluate','migrate','identity','commitment'} and isinstance(node,ast.Return) and node.value is not None and not isinstance(node.value,(ast.Constant,ast.Dict)):
   # Only top-level return expressions in the actual model; exclude nested safe_refs.
   if f.name=='payload_ok' and any(node is child for nested in f.body if isinstance(nested,ast.FunctionDef) for child in ast.walk(nested)):continue
   for p in (node.value.values if isinstance(node.value,ast.BoolOp) and isinstance(node.value.op,ast.And) else [node.value]):add(f.name,p,True,'accept-predicate')
  if f.name=='migrate' and isinstance(node,ast.Return) and isinstance(node.value,ast.IfExp):
   add(f.name,node.value.test,True,'migration-result-validity')
# Deduplicate equivalent mutation positions.
mutations=list({(x['function'],x['line'],x['column'],x['end_line'],x['end_column'],x['kind'],x['ast_dump'],x['replacement']):x for x in mutations}.values())

# Append the two numeric prerequisites; retain every G000..G176 meaning.
support_names={'numeric_atom_ok','numbers_ok','integer_boundary','parse_integer','parse_numeric_json'}
support=[x for x in tree.body if isinstance(x,ast.FunctionDef) and x.name in support_names]
atom=next(x for x in support if x.name=='numeric_atom_ok')
lexical=next(x for x in support if x.name=='parse_integer')
add('numeric_atom_ok',atom.body[-1].value,True,'numeric-domain-prerequisite')
add('parse_integer',lexical.body[0].test,False,'negative-zero-spelling')
if args.inventory:
 print(json.dumps(mutations,indent=2));sys.exit(0)
functions += list(helpers.values())
functions = support + functions
cases=[];controls=[]
def add_case(c,f,case,target='evaluate',base=None):
 d=m.semantic_input(c,f,case) if target=='evaluate' and base is None else copy.deepcopy(f['semantic_base'] if base is None else base)
 if not (target=='evaluate' and base is None):m.patch(d,case['changes'])
 row={'family':c['event_type'] if c else f['schema_ref'],'id':case['id'],'operation':case.get('operation'),
      'target':target,'changes_keys':list(case['changes']),'expected':case['expected'],'input':d,'contract':c,'caught_by':[],'errors_after_weakening':[]}
 got=call(m.__dict__,row);assert got==row['expected'],(row['family'],row['id'],got,row['expected'])
 (cases if refused(got) else controls).append(row)
def call(g,case):
 c,d,target=case['contract'],case['input'],case['target']
 if target=='evaluate':return g['evaluate'](c,case['operation'],d)
 if target in {'context_types_ok','authority_types_ok','browser_source_ok','identity_fields_types_ok','identity','commitment','object_input_present','browser_record_bytes_present','index_inputs_ok','admission_numbers_ok','original_evidence_ok'}:return g['predicate_ok'](c,target,d)
 if target=='payload_ok':return g[target](c,d['payload'],d['context'])
 if target=='envelope_ok':return g[target](c,d,retry=False)
 if target=='receipt_ok':return g[target](d)
 if target=='token_matches_storage':return g[target](d['selected_token'],d['storage_instance_id'])
 if target=='value_valid':return g[target](d['schema_ref'],d['value'])
 if target=='migrate':return g[target](d['kind'],d['source'],d['evidence'])
 if target=='application_source_present':return g[target](d['application_source'])
 if target=='original_output_present':return g[target](d['application_source']['original_output'])
 if target=='outcome_present':return g[target](d['outcome'])
 if target=='admission_present':return g[target](d['admitted_sequence'])
 if target=='numeric_prerequisite':
  if d['token']=='-0':
   try:return g['parse_integer'](d['token'] if d['negative'] else '0')==0
   except ValueError:return False
  return g['numeric_atom_ok'](d['data'])
 raise AssertionError(target)
def refused(got):
 if isinstance(got,dict) and 'result' in got:return got['result'] in {'REFUSE','UNAVAILABLE','PENDING'}
 return got is None or got is False
for c in cs:
 f=next(z for z in fs if z['event_type']==c['event_type'])
 for case in f['semantic_cases']:
  add_case(c,f,case)
  if case.get('single_defect'):
   assert len(case['changes'])==1
   add_case(c,f,dict(case,id=case['id']+'-parent',expected=case['parent_expected'],changes={}),base=m.semantic_parent(c,f,case))
 for case in f.get('predicate_cases',[]):
  add_case(c,f,dict(case,expected=False),case['target'])
  add_case(c,f,dict(case,id=case['id']+'-parent',expected=True,changes={}),case['target'])
for f in m.read('Plans/ds15_value_contract_fixtures.json'):
 for case in f['cases']:
  data=copy.deepcopy(f['positive']);m.patch(data,case['changes'])
  add_case(None,f,{'id':case['id'],'changes':{},'expected':case['valid']},'value_valid',{'schema_ref':f['schema_ref'],'value':data})
 for case in f.get('migration_cases',[]):add_case(None,f,case,'migrate',f['migration_base'])
proofs=m.read('Plans/ds15_guard_proof_fixtures.json')
for proof in proofs:
 c=next((c for c in cs if c['event_type']==proof.get('event_type')),None)
 f=next(z for z in fs if z['event_type']==c['event_type']) if c else {'schema_ref':proof['schema_ref']}
 target=proof['target'] if proof['target'] in {'payload_ok','envelope_ok','context_types_ok','authority_types_ok','browser_source_ok','identity_fields_types_ok','identity','commitment','object_input_present','browser_record_bytes_present','index_inputs_ok','admission_numbers_ok','original_evidence_ok','value_valid','migrate'} else 'evaluate'
 operation=proof['target'] if target=='evaluate' else None
 for negative in (False,True):
  data=m.guard_proof_input(proof,negative)
  probe={'id':proof['id']+('' if negative else '-parent'),'operation':operation,'changes':{}}
  probe['expected']=call(m.__dict__,{'contract':c,'input':data,'target':target,'operation':operation})
  assert refused(probe['expected'])==negative,('invalid guard proof baseline',probe)
  add_case(c,f,probe,target,data)
numeric_grammar=[]
for case in m.read('Plans/ds15_numeric_contract_fixtures.json'):
 if case['token'] in ('01','00','-01'):
  assert not m.numeric_guard_result(case)
  numeric_grammar.append(case['id'])
  continue
 c=next(c for c in cs if c['event_type']==case['event_type'])
 f=next(f for f in fs if f['event_type']==case['event_type'])
 for negative in (False,True):
  data=m.numeric_input(case,negative)[1] if case['token']!='-0' else None
  if data is not None and case['target']!='atom':
   for key in case['path'].split('/'):
    data=data[int(key)] if isinstance(data,list) else data[key]
  probe={'id':case['id']+('' if negative else '-parent'),'changes':{},'expected':case['valid'] if negative else True}
  add_case(c,f,probe,'numeric_prerequisite',{'token':case['token'],'negative':negative,'data':data})
class Replace(ast.NodeTransformer):
 def __init__(self,mut):self.mut=mut;self.changed=0
 def generic_visit(self,node):
  expected=(self.mut['kind'],self.mut['line'],self.mut['column'],self.mut['end_line'],self.mut['end_column'],self.mut['ast_dump'])
  if isinstance(node,ast.expr) and fingerprint(node)==expected:
   self.changed+=1
   return ast.copy_location(ast.Constant(self.mut['replacement']),node)
  return super().generic_visit(node)
def exact_weaken(original,mut):
 """Change one expression and independently check every other AST field."""
 matches=[]
 def find(node,path=()):
  if isinstance(node,ast.expr) and fingerprint(node)==(mut['kind'],mut['line'],mut['column'],mut['end_line'],mut['end_column'],mut['ast_dump']):matches.append(path)
  for key,value in ast.iter_fields(node):
   if isinstance(value,ast.AST):find(value,path+(key,))
   elif isinstance(value,list):
    for i,item in enumerate(value):
     if isinstance(item,ast.AST):find(item,path+(key,i))
 find(original);assert len(matches)==1,('ambiguous/missing target',mut)
 path=matches[0];expected=copy.deepcopy(original);parent=expected
 for key in path[:-1]:parent=parent[key] if isinstance(key,int) else getattr(parent,key)
 old=parent[path[-1]] if isinstance(path[-1],int) else getattr(parent,path[-1])
 replacement=ast.copy_location(ast.Constant(mut['replacement']),old)
 if isinstance(path[-1],int):parent[path[-1]]=replacement
 else:setattr(parent,path[-1],replacement)
 visitor=Replace(mut);actual=visitor.visit(copy.deepcopy(original))
 assert visitor.changed==1
 assert ast.dump(actual,include_attributes=True)==ast.dump(expected,include_attributes=True),'Unrelated AST changed'
 return actual
# The corpus inputs are immutable. Reuse exact original predicate results
# between mutants when that predicate is not the one being weakened.
def memoized_predicate(fn):
 cache={}
 def wrapped(*args,**kwargs):
  key=(tuple(id(x) for x in args),tuple(sorted(kwargs.items())))
  if key not in cache:cache[key]=(args,kwargs,fn(*args,**kwargs))
  return cache[key][2]
 return wrapped
all_names=names|presence_helpers|support_names
unchanged_predicates={n:memoized_predicate(getattr(m,n)) for n in (names|presence_helpers)-{'evaluate','migrate'}}
dependencies={f.name:{n.func.id for n in ast.walk(f) if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id in all_names} for f in functions}
def depends_on(name,target,seen=()):
 return name==target or (name not in seen and any(depends_on(n,target,(*seen,name)) for n in dependencies.get(name,())))
def model(ids):
 if any(mutations[i]['function'] in support_names for i in ids):
  # The numeric atom is shared by decorators AND a schema keyword. Recompile
  # the whole module for its mutation so no original validator/cache retains
  # the unmutated helper through its Python globals. Still change only the
  # one named AST expression, with the same independent rest-of-AST check.
  whole=copy.deepcopy(tree)
  for i in ids:
   mut=mutations[i]
   whole.body=[exact_weaken(f,mut) if isinstance(f,ast.FunctionDef) and f.name==mut['function'] else f for f in whole.body]
  g={'__file__':m.__file__,'__name__':'ds15_numeric_guard_mutant'}
  exec(compile(ast.fix_missing_locations(whole),m.__file__,'exec'),g)
  g['read']=pinned_read
  return g
 subset=copy.deepcopy(functions)
 for i in ids:
  mut=mutations[i]
  subset=[exact_weaken(f,mut) if f.name==mut['function'] else f for f in subset]
 g=dict(m.__dict__);exec(compile(ast.fix_missing_locations(ast.Module(body=subset,type_ignores=[])),'<ds15-guard-removal>','exec'),g)
 exec(compile(ast.Module(body=[next(f for f in tree.body if isinstance(f,ast.FunctionDef) and f.name=='predicate_ok')],type_ignores=[]),'<ds15-predicate-dispatch>','exec'),g)
 for name,fn in unchanged_predicates.items():
  if not any(depends_on(name,mutations[i]['function']) for i in ids):g[name]=fn
 return g

# F10 regression: removing receipt equality must preserve full-value custody.
# Its three first-receipt observations agree in every corrupt-commitment case.
assert mutations == m.read('Plans/ds15_guard_inventory.json'), 'Guard inventory changed without adjudication'
receipt_equality_id=next(i for i,z in enumerate(mutations) if z['guard']=="r == custody['first_append_receipt'] == result['first_append_receipt']")
regression=[];g032=model((receipt_equality_id,))
for c in cs:
 f=next(z for z in fs if z['event_type']==c['event_type'])
 case=next(z for z in f['semantic_cases'] if z['id']=='full-value-commitment-corrupt')
 d=m.semantic_input(c,f,case)
 assert d['receipt']==d['custody']['first_append_receipt']==d['issued_result']['first_append_receipt']
 got=g032['evaluate'](c,case['operation'],d)
 assert got==case['expected'],('G032 bypassed commitment',c['event_type'],got)
 regression.append({'family':c['event_type'],'case':case['id'],'got':got})
def memory_floor():
 import subprocess
 while True:
  available=int(subprocess.check_output(['free','-g']).decode().splitlines()[1].split()[-1])
  if available>=6:return
  print(json.dumps({'paused':'under 6 GB available','available_gib':available}),flush=True)
  time.sleep(30)

outputs=[];t=time.monotonic()
for i,mut in enumerate(mutations):
 memory_floor()
 g=model((i,))
 accepted=[];control_failures=[]
 for case in cases:
  # Mutated family-specific predicates cannot affect any other family, but all
  # negatives are exercised so masked cases remain visible in the export.
  try:got=call(g,case)
  except Exception as e:
   case['errors_after_weakening'].append(i);continue
  if not refused(got):
   case['caught_by'].append(i);accepted.append({'family':case['family'],'case':case['id'],'result':got})
 for case in controls:
  try:got=call(g,case)
  except Exception as e:got={'exception':type(e).__name__}
  if got!=case['expected']:control_failures.append({'family':case['family'],'case':case['id'],'got':got,'expected':case['expected']})
 outputs.append(dict(id=i,**mut,negative_successes=accepted,positive_regressions=control_failures))

 if i%10==0:print(json.dumps({'mutant':i,'total':len(mutations),'seconds':round(time.monotonic()-t,1)}),flush=True)
 (O/'guard-audit-progress.json').write_text(json.dumps({'completed':i+1,'total':len(mutations),'seconds':round(time.monotonic()-t,1)}))
# Named duplicate sets are the only multi-predicate weakenings. Every proper
# subset must still reject its witness without an exception; the complete set
# must accept. Run the entire corpus and all positive controls for every set.
import itertools
duplicate_proofs=[];duplicate_outputs=[]
for ids in sorted({tuple(p['guards']) for p in proofs if len(p['guards'])>1}):
 memory_floor()
 witnesses=[p for p in proofs if tuple(p['guards'])==ids]
 models={subset:model(subset) for n in range(1,len(ids)+1) for subset in itertools.combinations(ids,n)}
 for proof in witnesses:
  case=next(z for z in cases if z['id']==proof['id'])
  outcomes=[]
  for subset,g in models.items():
   try:got=call(g,case);error=None
   except Exception as e:got=None;error=repr(e)
   outcomes.append({'removed':subset,'result':got,'exception':error})

  proved=all(z['exception'] is None and ((not refused(z['result']))==(tuple(z['removed'])==ids)) for z in outcomes)
  duplicate_proofs.append({'case':proof['id'],'guards':ids,'defect':proof['defect'],'proper_subsets_refuse':proved,'passed':proved,'outcomes':outcomes})
 g=models[ids];accepted=[];errors=[];control_failures=[]
 label='+'.join('G%03d'%i for i in ids)
 for case in cases:
  try:got=call(g,case)
  except Exception as e:errors.append({'family':case['family'],'case':case['id'],'exception':repr(e)});continue
  if not refused(got):
   case.setdefault('caught_by_duplicate_sets',[]).append(label)
   accepted.append({'family':case['family'],'case':case['id'],'result':got})
 for case in controls:
  try:got=call(g,case)
  except Exception as e:got={'exception':repr(e)}
  if got!=case['expected']:control_failures.append({'family':case['family'],'case':case['id'],'got':got,'expected':case['expected']})
 duplicate_outputs.append({'id':label,'guards':ids,'negative_successes':accepted,'exceptions':errors,'positive_regressions':control_failures})
for case in cases:
 case.pop('input');case.pop('contract')
summary={c['event_type']:{'negative_count':sum(z['family']==c['event_type'] for z in cases),'unexposed':[z['id'] for z in cases if z['family']==c['event_type'] and not z['caught_by']]} for c in cs}
result={'status':'partial' if any(not z['passed'] for z in duplicate_proofs) or any(not z['caught_by'] for z in cases) or any(not o['negative_successes'] or o['positive_regressions'] for o in outputs) else 'pass',
        'mutants':len(outputs),'negatives':len(cases),
        'unexposed':sum(not z['caught_by'] for z in cases),
        'guards_without_flips':sum(not o['negative_successes'] for o in outputs),
        'positive_regressions':sum(len(o['positive_regressions']) for o in outputs+duplicate_outputs),
        'named_duplicate_sets':len(duplicate_outputs),
        'duplicate_witnesses':len(duplicate_proofs),
        'failed_duplicate_witnesses':[z['case'] for z in duplicate_proofs if not z['passed']],
        'guards_without_single_or_duplicate_proof':[o['id'] for o in outputs if not o['negative_successes'] and not any(o['id'] in z['guards'] and z['passed'] for z in duplicate_proofs)],
        'unexposed_after_duplicate_sets':sum(not z['caught_by'] and not z.get('caught_by_duplicate_sets') for z in cases),
        'numeric_grammar_refusals':numeric_grammar,
        'seconds':round(time.monotonic()-t,1)}
assert source==(R/'scripts/pm-ds15-event-contracts.py').read_text(), 'Checker changed during audit'
for original_schema,encoded_schema,_ in fast_validators.values():
 assert json.dumps(original_schema,sort_keys=True)==encoded_schema,'Cached schema mutated during audit'
for path,digest in input_hashes.items():
 assert digest==hashlib.sha256((R/path).read_bytes()).hexdigest(), 'Input changed during audit: '+path
input_hashes['scripts/pm-ds15-event-contracts.py']=hashlib.sha256(source.encode()).hexdigest()
args.out.write_text(json.dumps({'result':result,'inputs_sha256':input_hashes,'mutator_regression':regression,'mutants':outputs,'duplicate_proofs':duplicate_proofs,'duplicate_mutants':duplicate_outputs,'negatives':cases,'summary':summary},indent=2)+'\n')
print(json.dumps(result),flush=True)
sys.exit(0 if result['status']=='pass' else 1)
