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
 key=(schema['$ref'],id(schema.get('$defs'))) if '$ref' in schema else id(schema)
 if key not in fast_validators:fast_validators[key]=CachedValidation(original_validator(schema))
 return fast_validators[key]
m.validator=fast_validator
cs=m.read('Plans/ds15_event_contracts.json');fs=m.read('Plans/ds15_event_contract_fixtures.json');tree=ast.parse(source)
names={'envelope_ok','receipt_ok','token_matches_storage','payload_ok','evaluate','value_valid','migrate'}
functions=[x for x in tree.body if isinstance(x,ast.FunctionDef) and x.name in names]
mutations=[]
def add(function,node,replacement,label):
 mutations.append({'function':function,'line':node.lineno,'column':node.col_offset,'kind':type(node).__name__,'guard':ast.unparse(node),'replacement':replacement,'label':label})
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
  if f.name not in {'evaluate','migrate'} and isinstance(node,ast.Return) and node.value is not None and not isinstance(node.value,(ast.Constant,ast.Dict)):
   # Only top-level return expressions in the actual model; exclude nested safe_refs.
   if f.name=='payload_ok' and node.lineno<222 and node.lineno not in [217,219,221]:continue
   for p in (node.value.values if isinstance(node.value,ast.BoolOp) and isinstance(node.value.op,ast.And) else [node.value]):add(f.name,p,True,'accept-predicate')
  if f.name=='migrate' and isinstance(node,ast.Return) and isinstance(node.value,ast.IfExp):
   add(f.name,node.value.test,True,'migration-result-validity')
# Deduplicate equivalent mutation positions.
mutations=list({(x['line'],x['column'],x['replacement']):x for x in mutations}.values())
cases=[];controls=[]
def add_case(c,f,case,target='evaluate',base=None):
 d=copy.deepcopy(f['semantic_base'] if base is None else base);m.patch(d,case['changes'])
 row={'family':c['event_type'] if c else f['schema_ref'],'id':case['id'],'operation':case.get('operation'),
      'target':target,'changes_keys':list(case['changes']),'expected':case['expected'],'input':d,'contract':c,'caught_by':[],'errors_after_weakening':[]}
 got=call(m.__dict__,row);assert got==row['expected'],(row['family'],row['id'],got,row['expected'])
 (cases if refused(got) else controls).append(row)
def call(g,case):
 c,d,target=case['contract'],case['input'],case['target']
 if target=='evaluate':return g['evaluate'](c,case['operation'],d)
 if target=='payload_ok':return g[target](c,d['payload'],d['context'])
 if target=='envelope_ok':return g[target](c,d,retry=False)
 if target=='receipt_ok':return g[target](d)
 if target=='token_matches_storage':return g[target](d['selected_token'],d['storage_instance_id'])
 if target=='value_valid':return g[target](d['schema_ref'],d['value'])
 if target=='migrate':return g[target](d['kind'],d['source'],d['evidence'])
 raise AssertionError(target)
def refused(got):
 if isinstance(got,dict) and 'result' in got:return got['result'] in {'REFUSE','UNAVAILABLE','PENDING'}
 return got is None or got is False
for c in cs:
 f=next(z for z in fs if z['event_type']==c['event_type'])
 for case in f['semantic_cases']:add_case(c,f,case)
 for case in f.get('predicate_cases',[]):
  add_case(c,f,dict(case,expected=False),case['target'])
  add_case(c,f,dict(case,id=case['id']+'-parent',expected=True,changes={}),case['target'])
for f in m.read('Plans/ds15_value_contract_fixtures.json'):
 for case in f['cases']:
  data=copy.deepcopy(f['positive']);m.patch(data,case['changes'])
  add_case(None,f,{'id':case['id'],'changes':{},'expected':case['valid']},'value_valid',{'schema_ref':f['schema_ref'],'value':data})
 for case in f.get('migration_cases',[]):add_case(None,f,case,'migrate',f['migration_base'])
class Replace(ast.NodeTransformer):
 def __init__(self,mut):self.mut=mut
 def generic_visit(self,node):
  if isinstance(node,ast.expr) and (getattr(node,'lineno',0),getattr(node,'col_offset',0))==(self.mut['line'],self.mut['column']):return ast.copy_location(ast.Constant(self.mut['replacement']),node)
  return super().generic_visit(node)
# The corpus inputs are immutable. Reuse exact original predicate results
# between mutants when that predicate is not the one being weakened.
def memoized_predicate(fn):
 cache={}
 def wrapped(*args,**kwargs):
  key=(tuple(id(x) for x in args),tuple(sorted(kwargs.items())))
  if key not in cache:cache[key]=fn(*args,**kwargs)
  return cache[key]
 return wrapped
unchanged_predicates={n:memoized_predicate(getattr(m,n)) for n in names-{'evaluate','migrate'}}
outputs=[];t=time.monotonic()
for i,mut in enumerate(mutations):
 subset=copy.deepcopy(functions)
 for f in subset:
  if f.name==mut['function']:Replace(mut).visit(f)
 g=dict(m.__dict__);exec(compile(ast.fix_missing_locations(ast.Module(body=subset,type_ignores=[])),'<ds15-guard-removal>','exec'),g)
 for name,fn in unchanged_predicates.items():
  if name!=mut['function']:g[name]=fn
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
for case in cases:
 case.pop('input');case.pop('contract')
summary={c['event_type']:{'negative_count':sum(z['family']==c['event_type'] for z in cases),'unexposed':[z['id'] for z in cases if z['family']==c['event_type'] and not z['caught_by']]} for c in cs}
result={'status':'partial' if any(not z['caught_by'] for z in cases) or any(not o['negative_successes'] or o['positive_regressions'] for o in outputs) else 'pass',
        'mutants':len(outputs),'negatives':len(cases),
        'unexposed':sum(not z['caught_by'] for z in cases),
        'guards_without_flips':sum(not o['negative_successes'] for o in outputs),
        'positive_regressions':sum(len(o['positive_regressions']) for o in outputs),
        'seconds':round(time.monotonic()-t,1)}
assert source==(R/'scripts/pm-ds15-event-contracts.py').read_text(), 'Checker changed during audit'
for path,digest in input_hashes.items():
 assert digest==hashlib.sha256((R/path).read_bytes()).hexdigest(), 'Input changed during audit: '+path
input_hashes['scripts/pm-ds15-event-contracts.py']=hashlib.sha256(source.encode()).hexdigest()
args.out.write_text(json.dumps({'result':result,'inputs_sha256':input_hashes,'mutants':outputs,'negatives':cases,'summary':summary},indent=2)+'\n')
print(json.dumps(result),flush=True)
sys.exit(0 if result['status']=='pass' else 1)
