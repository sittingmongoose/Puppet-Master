"""Optional first-refusal witness search; no search result earns proof credit.

Only replayed single-defect inputs are sealed. Wrong refusals and exceptions
never become mutation kills. Immutable schema/codec context stays unchanged.
"""
import ast
import copy
import inspect
import json
import os
from pathlib import Path
import re
import sys
from pm_goal_deleted_case_ops import Editor,at,nodes


def search(frozen,collector,seeds,files):
    found=set(collector.candidates);selected=[];attempts=0;skipped={}
    part,total=map(int,os.environ.get('PNC019_FROZEN_PART','0/1').split('/'))
    budget=int(os.environ.get('PNC019_FROZEN_ATTEMPTS_PER_GUARD','80'))
    alternatives={}
    def enums(value):
        if isinstance(value,dict):
            choices=[x for x in value.get('enum',[])if type(x)in (str,int,float,bool)]
            for choice in choices:
                alternatives.setdefault((type(choice),choice),[]).extend(x for x in choices if type(x)is not type(choice)or x!=choice)
            for child in value.values():enums(child)
        elif isinstance(value,list):
            for child in value:enums(child)
    for resource in frozen.RESOURCES.values():enums(resource.contents)
    def checkpoint():
        collector.checkpoint()
        if collector.checkpoint_path:
            (collector.checkpoint_path/'new-frozen-witnesses.json').write_text(json.dumps(selected,indent=1)+'\n')
    for ordinal,(fn,base,label)in enumerate(seeds):
        if ordinal%total!=part:continue
        def evaluate(value,fn=fn):
            try:fn(*value['args'],**value['kwargs'])
            except frozen.ExpectedRefusal as e:return e.errors
            return set()
        collector.invoke('frozen-helper/control/'+label,evaluate,base,True)
        code=fn.__func__.__code__ if inspect.ismethod(fn)else fn.__code__
        end=max(line for _,_,line in code.co_lines()if line is not None)
        wanted={name:row for name,row in collector.rows.items()if name not in found and any(site[0]==code.co_filename and code.co_firstlineno<=site[1]<=end for site in row['sites'])}
        if not wanted:continue
        parameters=list(inspect.signature(fn).parameters)
        fixed={'admission_schema','receipt_schema','routes','compat','sid','mp','bdig','schema','registry'}
        def mutable(path):
            if not path:return False
            if path[0]=='args':
                if len(path)<=2:return False
                if path[1]<len(parameters)and parameters[path[1]]in fixed:return False
            if path[0]=='kwargs'and(len(path)<2 or path[1]in fixed):return False
            return True
        paths=[item for item in nodes(base)if mutable(item[0])]
        editor=Editor(base,frozen.helper_hash_functions(5),version=5)
        tree=ast.parse(Path(code.co_filename).read_text());tried=set()
        order=sorted(wanted,key=lambda name:(min(site[1]for site in wanted[name]['sites']if site[0]==code.co_filename),name))
        for target in order:
            if target in found:continue
            lines={site[1]for site in wanted[target]['sites']if site[0]==code.co_filename}
            calls=[node for node in ast.walk(tree)if isinstance(node,ast.Call)and node.lineno in lines and len(node.args)>1]
            tail=target.rsplit('/',1)[-1]
            matching=[n for n in calls if isinstance(n.args[1],ast.Constant)and n.args[1].value==tail]
            predicates=[n.args[0]for n in matching or calls]
            keys={n.value for predicate in predicates for n in ast.walk(predicate)if isinstance(n,ast.Constant)and type(n.value)is str}
            # A loop guard's literal label ends with its actual field name.
            if re.fullmatch('[A-Za-z_][A-Za-z0-9_]*',tail.split()[-1]):keys.add(tail.split()[-1])
            relevant=[(p,v)for p,v in paths if any(k in keys for k in p if type(k)is str)]
            relevant.sort(key=lambda item:(isinstance(item[1],(dict,list)),item[0][-1]not in keys,len(item[0]),repr(item[0])))
            spent=0
            for path,original in relevant:
                if spent>=budget or target in found:break
                depths=[d for d in range(2,len(path))if isinstance(at(base,path[:d]),(dict,list))and len(editor.matches[editor.fingerprint(at(base,path[:d]))])>1]
                modes=['simple']+['coherent_depth'+str(d)for d in depths]+['coherent','coherent_hash_claim','remove','coherent_remove','rename','coherent_rename']
                if path[-1]=='replayed'and type(original)is bool:modes=['coherent_replay']+modes
                if path[-1]=='state'and original=='terminal'and 'original_owner_result'in at(base,path[:-1]):modes=['coherent_pending_create']+modes
                if path[-1]=='state'and original=='deleted'and 'original_dispatch_custody'in at(base,path[:-1]):modes=['coherent_pending_delete']+modes
                choices=[]
                if type(original)in (str,int,float,bool):choices=alternatives.get((type(original),original),[])
                if type(original)in (int,float):choices=[0,1,-1]+choices
                if isinstance(original,(dict,list)):choices=[None,[]]+choices
                encoded=list(dict.fromkeys(json.dumps(v,separators=(',',':'))for v in choices))[:12]
                modes+=['coherent_value:'+value for value in encoded]
                for depth in depths[:2]:modes+=['coherent_depth'+str(depth)+'_value:'+value for value in encoded]
                for mode in modes:
                    key=(path,mode)
                    if key in tried:continue
                    tried.add(key)
                    try:value=editor.edit(path,mode)
                    except (TypeError,ValueError,KeyError,IndexError):continue
                    if not frozen.fixed_context_unchanged(fn,base,value):continue
                    attempts+=1;spent+=1
                    previous=collector.active;collector.active=[]
                    try:result=evaluate(copy.deepcopy(value))
                    except Exception as e:
                        skipped[type(e).__name__]=skipped.get(type(e).__name__,0)+1
                        continue
                    finally:observed=collector.active;collector.active=previous
                    if len(result)==1:
                        name=next(iter(result));first=next((n for n,holds in observed if not holds),None)
                        if name==first and name not in found:
                            source='frozen-helper/'+mode+'/'+label+'/'+repr(path)
                            collector.invoke(source,evaluate,value,False)
                            collector.candidates[name]=(evaluate,copy.deepcopy(value),source)
                            collector.snapshots[name]=copy.deepcopy(value)
                            selected.append(dict(expected_refusal=name,seed=frozen.seed_ref(fn,label,files),path=list(path),operation=mode,hash_recipe_version=5,input_digest='frozen_function_context_v1',input_sha256=__import__('pm_goal_guard_sweep').digest(value)))
                            found.add(name);checkpoint()
                    if attempts%250==0:
                        print('targeted frozen attempts',attempts,'new',len(selected),'target',target,file=sys.stderr,flush=True);checkpoint()
                    if spent>=budget or target in found:break
    collector.frozen_exploration=dict(attempts=attempts,selected=len(selected),nonwitness_exceptions=skipped)
    checkpoint()
