"""DCH clause witnesses for its whole-definition Method B schema boundary.

This is a DCH test adapter, not a schema validator or a new cut engine. All
verdicts come from the original mandatory DCH validator. SD01 cuts the complete
consumed definition; this report never calls a keyword observation an atomic
schema-cut proof. Inventory includes selectors, dormant definitions and the
checkpoint's unchanged supplementary owner constraints.
"""
import copy
import hashlib
import json
from dataclasses import dataclass
from pathlib import Path

from jsonschema import Draft202012Validator
from pm_dch_formats import effective_checkpoint_schema, validator
from pm_dch_c12_cases import branch_originals
from pm_dch_worktree import FAMILIES, fixtures, source_schema, RECEIPT_SCHEMA

ROOT = Path(__file__).resolve().parents[1]
ASSERTIONS = {'type','const','enum','minimum','maximum','exclusiveMinimum','exclusiveMaximum',
              'minLength','maxLength','pattern','format','minItems','maxItems','uniqueItems','additionalProperties','not'}
ANNOTATIONS = {'$id','$schema','title','description','$comment','default','examples','deprecated','readOnly','writeOnly'}
APPLICATORS = {'$ref','allOf','anyOf','oneOf','if','then','else','properties','items','$defs'}


def pointer(path):
    return '/'+'/'.join(str(x).replace('~','~0').replace('/','~1') for x in path) if path else ''


def at(value,path):
    for key in path:value=value[key]
    return value


def changed(value,path,new,delete=False):
    out=copy.deepcopy(value)
    if not path:return copy.deepcopy(new)
    target=at(out,path[:-1])
    if delete:del target[path[-1]]
    else:target[path[-1]]=copy.deepcopy(new)
    return out


def local_ref(root,node,sp):
    seen=set()
    while isinstance(node,dict) and '$ref' in node:
        ref=node['$ref']
        if not ref.startswith('#/') or ref in seen:raise ValueError('DCH reference outside local closed graph: '+ref)
        seen.add(ref);sp=tuple(x.replace('~1','/').replace('~0','~') for x in ref[2:].split('/'));node=at(root,sp)
    return node,sp


def sites(root):
    """Every actual schema occurrence; data in const/enum is never traversed as a schema."""
    def walk(node,sp):
        if isinstance(node,bool):
            yield dict(path=pointer(sp),keyword='$boolean',value=node,node_path=pointer(sp));return
        for key,val in node.items():
            if key=='required':
                for name in val:yield dict(path=pointer(sp+(key,name)),keyword=key,value=name,node_path=pointer(sp))
            elif key in ASSERTIONS or key in ANNOTATIONS or key in APPLICATORS:
                yield dict(path=pointer(sp+(key,)),keyword=key,value=copy.deepcopy(val),node_path=pointer(sp))
            else:raise ValueError('uninventoried DCH schema keyword: '+key)
            if key in ('$defs','properties'):
                for name,sub in val.items():yield from walk(sub,sp+(key,name))
            elif key in ('allOf','anyOf','oneOf'):
                for i,sub in enumerate(val):yield from walk(sub,sp+(key,i))
            elif key in ('if','then','else','items','not') and isinstance(val,(dict,bool)):
                yield from walk(val,sp+(key,))
            elif key=='additionalProperties' and isinstance(val,dict):yield from walk(val,sp+(key,))
    yield from walk(root,())


def active_nodes(root,value):
    """Trace schema/instance occurrences; local Draft validation only selects applicator arms.

    Enforcement always uses the complete original DCH validator, including its
    shared number/time profiles and separate HTTPS/UUID checks.
    """
    seen=set()
    def walk(node,v,sp,ip,polarity=True):
        node,sp=local_ref(root,node,sp)
        if not isinstance(node,dict):return
        k=(sp,ip,polarity)
        if k in seen:return
        seen.add(k)
        yield node,v,sp,ip,polarity
        if isinstance(v,dict):
            for name,sub in node.get('properties',{}).items():
                if name in v:yield from walk(sub,v[name],sp+('properties',name),ip+(name,),polarity)
            extra=node.get('additionalProperties')
            if isinstance(extra,dict):
                for name in v.keys()-node.get('properties',{}).keys():
                    yield from walk(extra,v[name],sp+('additionalProperties',),ip+(name,),polarity)
        if isinstance(v,list) and isinstance(node.get('items'),dict):
            for i,item in enumerate(v):yield from walk(node['items'],item,sp+('items',),ip+(i,),polarity)
        for key in ('allOf','anyOf','oneOf'):
            for i,sub in enumerate(node.get(key,[])):
                resolved,_=local_ref(root,sub,sp+(key,i))
                if key=='allOf' or Draft202012Validator(resolved).is_valid(v):
                    yield from walk(sub,v,sp+(key,i),ip,polarity)
        if 'if' in node:
            yield from walk(node['if'],v,sp+('if',),ip,False)
            branch='then' if Draft202012Validator(node['if']).is_valid(v) else 'else'
            if branch in node:yield from walk(node[branch],v,sp+(branch,),ip,polarity)
        if 'not' in node:yield from walk(node['not'],v,sp+('not',),ip,False)
    yield from walk(root,value,(),())


def proposals(node,v):
    """Finite boundary witnesses for the exact DCH schema keyword vocabulary."""
    for key,rule in node.items():
        if key=='required' and isinstance(v,dict):
            for field in rule:
                if field in v:
                    out=copy.deepcopy(v);del out[field];yield key,field,out
        elif key=='additionalProperties' and rule is False and isinstance(v,dict):
            yield key,None,{**v,'DCH_UNEXPECTED':True}
        elif key=='type':
            for new in (None,True,1.5,'DCH_OTHER',[],{}):
                if not Draft202012Validator({'type':rule}).is_valid(new):yield key,None,new
        elif key=='const':yield key,None,'DCH_OTHER' if rule!='DCH_OTHER' else None
        elif key=='enum':yield key,None,'DCH_NOT_IN_ENUM'
        elif key in ('minimum','exclusiveMinimum'):yield key,None,rule-1
        elif key in ('maximum','exclusiveMaximum'):yield key,None,rule+1
        elif key=='minLength':yield key,None,'x'*max(0,rule-1)
        elif key=='maxLength':yield key,None,'x'*(rule+1)
        elif key=='pattern' and isinstance(v,str):
            for new in (v+'\n','!',v[:-1]+'!',v[:-1]+'z'):
                yield key,None,new
        elif key=='format':
            choices={'date-time':['2026-02-29T00:00:00Z','2026-11-04T24:00:00Z','2026-11-04T00:00:00'],
                     'uri':['https://bad%ZZ/path','https://[invalid]/x'],
                     'uuid':['not-a-uuid','00000000-0000-4000-8000-00000000000!']}
            for new in choices[rule]:yield key,None,new
        elif key=='maxItems' and isinstance(v,list):yield key,None,(copy.deepcopy(v[:1]) or ['pmref:fixture:x'])*(rule+1)
        elif key=='minItems' and rule>0:yield key,None,[]
        elif key=='uniqueItems' and rule is True and v:yield key,None,[copy.deepcopy(v[0]),copy.deepcopy(v[0])]
        elif key=='not' and isinstance(rule,dict) and 'const' in rule:yield key,None,rule['const']


def error_paths(root,errors):
    def canonical(path):
        node=root;sp=()
        for token in path:
            node,sp=local_ref(root,node,sp)
            node=node[token];sp=sp+(token,)
        return pointer(sp)
    pending=list(errors)
    found=[]
    while pending:
        e=pending.pop();pending.extend(e.context)
        try:sp=canonical(tuple(e.absolute_schema_path))
        except (KeyError,IndexError,TypeError):sp=pointer(tuple(e.absolute_schema_path))
        member=None
        if e.validator=='required' and isinstance(e.instance,dict):
            # jsonschema emits one error per missing member; retain every actual missing member.
            for field in e.validator_value:
                if field not in e.instance:found.append((sp+'/'+field,tuple(e.absolute_path)))
        else:found.append((sp,tuple(e.absolute_path)))
    return found


@dataclass
class Boundary:
    id: str
    family: str
    source: str
    schema: dict
    controls: list
    validator: object


def populate_named_plans(value):
    """Populate every Project WorkflowScope named-plan arm in one control (all source occurrences)."""
    if isinstance(value,dict):
        if value.get('schema_id')=='pm.workflow_scope.v2' and value.get('scope_kind')=='project':
            value['named_plan_id']='fixture_named_plan'
        for child in value.values():populate_named_plans(child)
    elif isinstance(value,list):
        for child in value:populate_named_plans(child)
    return value


def boundaries(selected=None):
    import pm_dch_events as dch
    import pm_dch_thread as thread
    from pm_dch_round7_oracles import OWNER_INVALID_ORIGINALS, OWNER_INVALID_CHECKPOINT_RETIRED
    retained=json.loads((ROOT/'Plans/dch_retained_history_fixtures.json').read_text())
    prior=json.loads((ROOT/'Plans/dch_prior_v4_checkpoint_fixtures.json').read_text())['checkpoints']
    rows=json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']
    fs=json.loads((ROOT/'Plans/dch_event_contract_fixtures.json').read_text())
    cs=json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text())
    originals=fixtures()
    # CH2: the six ordinary thread/message/bundle families use their own original store.
    thread_originals,thread_branches=thread.fixtures(),thread.branches()
    for row in rows:
        f=row['event_type']
        if f not in FAMILIES+thread.FAMILIES or selected and f!=selected:continue
        ch2=f in thread.FAMILIES
        family_originals=thread_originals if ch2 else originals
        payload=json.loads((ROOT/row['payload_schema_ref']).read_text())
        pc=[copy.deepcopy(x['valid']) for x in fs if x['event_type']==f]
        if ch2:
            # Authored owner branches (attachments, roles, states, targets) are payload controls too.
            pc+=[copy.deepcopy(b['original']['result']) for e in ('project','application') for b in thread_branches[f+'/'+e]]
        # Explicit owner-valid branches: nullable strings, enums and failure outcomes.
        for base in list(pc):
            props=payload['$defs'][base['scope']['scope_kind']]['properties']
            for field,desc in props.items():
                for new in desc.get('enum',[]):
                    variant=copy.deepcopy(base);variant[field]=new
                    if field=='test_outcome':
                        variant['exit_code']=1 if new=='exit' else None
                        variant['error_ref']='pmref:fixture:process_error' if new=='process_error' else None
                    if validator(payload).is_valid(variant):pc.append(variant)
            if base['scope']['scope_kind']=='project':
                variant=copy.deepcopy(base);variant['scope']['named_plan_id']='fixture_named_plan';pc.append(variant)
        cp=next(c for c in cs if c['event_type']==f)
        cp_path=cp['schema_ref'].split('#')[0];cp_schema=json.loads((ROOT/cp_path).read_text())
        env=json.loads((ROOT/'Plans/event_record.schema.json').read_text())
        ev=[copy.deepcopy(x['record']) for x in fs if x['event_type']==f]
        if ch2:ev+=[copy.deepcopy(b['original']['record']) for e in ('project','application') for b in thread_branches[f+'/'+e]]
        # Exercise every nullable/nonempty-string and migration branch of EventRecord.
        for base in list(ev):
            for key,value in base.items():
                if value is None:
                    alt=copy.deepcopy(base);alt[key]=0 if key=='producer_sequence_id' else 'fixture_optional'
                    if validator(env).is_valid(alt):ev.append(alt)
            for key in base['migration']:
                alt=copy.deepcopy(base);alt['migration'][key]='fixture_migration';ev.append(alt)
        yield Boundary(f+'/payload',f,row['payload_schema_ref'],payload,pc,validator(payload))
        yield Boundary(f+'/envelope',f,'Plans/event_record.schema.json',env,ev,validator(env))
        checkpoint_controls=[copy.deepcopy(cp[k]) for k in ('valid','with_history','maximum_history')]
        populated=copy.deepcopy(cp['maximum_history']);populated['projection_refs']=['pmref:fixture:projection']
        for old in populated['history']:old['projection_refs']=['pmref:fixture:old_projection']
        checkpoint_controls.append(populated)
        yield Boundary(f+'/checkpoint',f,cp_path,effective_checkpoint_schema(cp_schema),
                       checkpoint_controls,validator(cp_schema))
        for edition in ('project','application'):
            if ch2:
                o=thread_originals[f+'/'+edition][0]
                s=thread.source_schema(row,edition)
                source_controls=[o]+[b['original'] for b in thread_branches[f+'/'+edition]]
                if edition=='project':source_controls.append(populate_named_plans(copy.deepcopy(o)))
                yield Boundary(f+'/source/'+edition,f,'scripts/pm_dch_thread.py:source_schema('+edition+')',s,source_controls,validator(s))
                continue
            o=originals[f+'/'+edition][0]
            s=source_schema(row,edition)
            source_controls=[o]+[v for _,v in branch_originals(o)]
            expanded=copy.deepcopy(o)
            if edition=='project':expanded['intent']['scope']['named_plan_id']='fixture_named_plan'
            for state in ('before','after'):
                expanded[state]['bindings']['other_thread']='other_worktree'
                expanded[state]['reverse']['other_worktree']='other_thread'
            source_controls.append(expanded)
            if edition=='project':
                # Each independent terminal outcome carries a WorkflowScope.
                # A populated named-plan arm must be witnessed at every source
                # schema occurrence, as well as in the frozen input scope.
                named=copy.deepcopy(o)
                def populate_scopes(value):
                    if isinstance(value,dict):
                        if value.get('schema_id')=='pm.workflow_scope.v2' and value.get('scope_kind')=='project':
                            value['named_plan_id']='fixture_named_plan'
                        for child in value.values():populate_scopes(child)
                    elif isinstance(value,list):
                        for child in value:populate_scopes(child)
                populate_scopes(named)
                source_controls.append(named)
            yield Boundary(f+'/source/'+edition,f,'scripts/pm_dch_worktree.py:source_schema('+edition+')',s,source_controls,validator(s))
        for rule,recipe in dch.RETAINED_RECIPES.items():
            events=[item for item in retained['events'] if item['event_type']==f and item['rule']==rule and item['case'] not in OWNER_INVALID_ORIGINALS]
            # Frozen v4 current-shape fields are witnessed with the original
            # captured v4 checkpoint source; all other roots use authored originals.
            cp_originals=[item['value'] for item in retained['checkpoints'] if item['event_type']==f and item['rule']==rule
                          and item['value']['history'][0]['retired_at_utc']!=OWNER_INVALID_CHECKPOINT_RETIRED]
            if rule=='strict-v4':
                old=next(item for item in prior if item['event_type']==f)
                cp_originals=[old['value']]
                events=[dict(record=old['source']['event_record'])]
            current_payload=validator(payload);current_env=validator(env);current_cp=validator(cp_schema)
            for component,path,current,values in [
                ('envelope','Plans/event_record.schema.json',current_env,[item['record'] for item in events]),
                ('payload',row['payload_schema_ref'],current_payload,[item['record']['payload'] for item in events if item['record']['payload_ref'] is None]),
                ('checkpoint',cp_path,current_cp,cp_originals)]:
                if not values:raise AssertionError('missing authored retained '+f+'/'+rule+'/'+component)
                definition=recipe['schemas'][path]
                if rule=='strict-v4' and path in recipe['shared_resource_sha256']:
                    assert hashlib.sha256((ROOT/path).read_bytes()).hexdigest()==recipe['shared_resource_sha256'][path]
                    definition=json.loads((ROOT/path).read_text())
                actual=dch.stored_validator(current,path,rule)
                # Include explicit frozen URI skips as recorded semantics; the
                # shared CV-1101 datetime rule remains mandatory in every recipe.
                yield Boundary(f+'/retained/'+rule+'/'+component,f,
                    'Plans/dch_retained_recipes.json#/recipes/'+rule+'/schemas/'+path,
                    definition,values+[v for v in (ev if component=='envelope' else pc if component=='payload' else []) if actual.is_valid(v)],actual)
        for name in ('AppendReceipt','original_event_value_commitment'):
            key='receipt' if name=='AppendReceipt' else 'commitment'
            yield Boundary(f+'/'+key,f,'Plans/event_append_receipt_contracts.schema.json#/$defs/'+name,
                           RECEIPT_SCHEMA[name],[family_originals[f+'/'+e][0][key] for e in ('project','application')],validator(RECEIPT_SCHEMA[name]))
    if selected in (None,'chat.response_stop_requested'):
        yield from stop_boundaries()


def stop_boundaries():
    """CH2 Stop: every complete definition the Stop writer, sealed reader and index consumer enforce.

    The Stop contract has one current edition (CV-647), so no retained recipe
    root exists for it; the request, outcome, EventRecord, source wrapper,
    receipt, commitment and nine-field token definitions are each one boundary.
    """
    import pm_dch_stop as stop
    f='chat.response_stop_requested'
    fixture=json.loads((ROOT/'Plans/dch_stop_contract_fixtures.json').read_text())
    data=json.loads((ROOT/'tests/fixtures/dch_c12_ch2/stop_originals.json').read_text())
    worlds={edition:[data['originals'][f+'/'+edition][0]]+[b['original'] for b in data['branches'][f+'/'+edition]]
            for edition in ('project','application')}
    def positives(surface):
        for case in fixture['cases']:
            if case['surface']==surface and not case['changes'] and case['expected'] is True:
                yield copy.deepcopy(fixture['bases'][case['base_id']])
    requests=[copy.deepcopy(o['result']) for e in worlds for o in worlds[e]]+list(positives('schema_request'))
    for base in list(requests):
        if base['scope']['scope_kind']=='project':requests.append(populate_named_plans(copy.deepcopy(base)))
    outcomes=list(positives('schema_outcome'))+[b['value'] for b in fixture['bases'].values() if isinstance(b,dict) and 'value' in b and 'context' in b]
    for base in list(outcomes):
        if base['outcome']=='cancelled':outcomes.append({**copy.deepcopy(base),'outcome':'timeout'})
        if base['scope']['scope_kind']=='project':outcomes.append(populate_named_plans(copy.deepcopy(base)))
    env=json.loads((ROOT/'Plans/event_record.schema.json').read_text())
    records=[copy.deepcopy(o['record']) for e in worlds for o in worlds[e]]
    for base in list(records):
        for key,value in base.items():
            if value is None:
                alt=copy.deepcopy(base);alt[key]=0 if key=='producer_sequence_id' else 'fixture_optional'
                if validator(env).is_valid(alt):records.append(alt)
        for key in base['migration']:
            alt=copy.deepcopy(base);alt['migration'][key]='fixture_migration';records.append(alt)
    yield Boundary(f+'/request',f,stop.REQUEST_PATH,stop.REQUEST_SCHEMA,requests,stop.REQUEST)
    yield Boundary(f+'/outcome',f,stop.OUTCOME_PATH,stop.OUTCOME_SCHEMA,outcomes,stop.OUTCOME)
    yield Boundary(f+'/envelope',f,'Plans/event_record.schema.json',env,records,validator(env))
    for edition in ('project','application'):
        s=stop.stop_source_schema(edition)
        controls=[copy.deepcopy(o) for o in worlds[edition]]
        if edition=='project':controls.append(populate_named_plans(copy.deepcopy(worlds[edition][0])))
        yield Boundary(f+'/source/'+edition,f,'scripts/pm_dch_stop.py:stop_source_schema('+edition+')',s,controls,validator(s))
    for name in ('AppendReceipt','original_event_value_commitment'):
        key='receipt' if name=='AppendReceipt' else 'commitment'
        yield Boundary(f+'/'+key,f,'Plans/event_append_receipt_contracts.schema.json#/$defs/'+name,RECEIPT_SCHEMA[name],
                       [worlds[e][0][key] for e in ('project','application')],validator(RECEIPT_SCHEMA[name]))
    tokens=[b['token'] for b in fixture['bases'].values() if isinstance(b,dict) and 'token' in b]
    yield Boundary(f+'/token',f,'Plans/dch_checkpoint_source_constraints.json#/source_constraint_schema',stop.TOKEN_SCHEMA,tokens,stop.TOKEN)


def run(m,selected=None):
    result={'route':'W3H whole-definition Method B; no atomic keyword-cut credit','boundaries':[], 'mutations':[], 'invalid_mutations':[]}
    for b in boundaries(selected):
        print('schema boundary '+b.id,flush=True)
        inv={site['path']:{**site,'controls':[],'negatives':[]} for site in sites(b.schema)}
        controls=[]
        nodes=[]
        if '/retained/' in b.id:
            augmented=[]
            for base in b.controls:
                if b.id.endswith('/checkpoint'):
                    extra=copy.deepcopy(base);extra['projection_refs']=['pmref:fixture:projection']
                    if not extra.get('history'):
                        retired=copy.deepcopy(extra);retired.pop('history',None);retired.update(state='retired',retired_at_utc='2026-11-04T00:00:00Z')
                        retired['publication_id']+=':retired'
                        extra['history']=[retired]
                    for old in extra.get('history',[]):old['projection_refs']=['pmref:fixture:old_projection']
                    if b.validator.is_valid(extra):augmented.append(extra)
                if b.id.endswith('/envelope') and base.get('producer_sequence_id') is None:
                    extra={**copy.deepcopy(base),'producer_sequence_id':0}
                    if b.validator.is_valid(extra):augmented.append(extra)
            b.controls+=augmented
        unique={}
        for base in b.controls:unique.setdefault(json.dumps(base,sort_keys=True),base)
        b.controls=list(unique.values())
        for ci,base in enumerate(b.controls):
            if not m.schema_admission(base,b.validator):raise AssertionError('invalid authored schema control '+b.id+'/'+str(ci))
            cid=b.id+'/C'+str(ci);controls.append(cid)
            for node,v,sp,ip,polarity in active_nodes(b.schema,base):
                nodes.append((ci,base,node,v,sp,ip,polarity))
                for key,rule in node.items():
                    tags=[pointer(sp+(key,name)) for name in rule] if key=='required' else [pointer(sp+(key,))]
                    for tag in tags:
                        if tag in inv:inv[tag]['controls'].append(dict(id=cid,instance=pointer(ip),positive=polarity))
        seen=set()
        for ci,base,node,v,sp,ip,polarity in nodes:
            if not polarity:continue
            for keyword,member,new in proposals(node,v):
                # Reuse one identical assertion/instance mutation across controls.
                # Applicator paths remain distinct, so a different active arm
                # never borrows a witness from its sibling.
                key=(sp,ip,keyword,member,None if keyword in ('required','additionalProperties') else json.dumps(new,sort_keys=True))
                if key in seen:continue
                seen.add(key)
                tag=pointer(sp+(keyword,)+( (member,) if member is not None else ()))
                if tag not in inv:continue
                candidate=changed(base,ip,new)
                errors=list(b.validator.iter_errors(candidate))
                paths=error_paths(b.schema,errors)
                # Only a failure at this exact occurrence and instance earns clause coverage.
                targeted=any(p==tag and path==ip for p,path in paths)
                mid=b.id+'/M'+str(len(result['mutations'])+len(result['invalid_mutations']))
                expected=('sd_complete','SD01_complete_definition','schema_refused')
                try:
                    m._schema_admission(candidate,b.validator);got=None
                except m.TableRefusal as e:got=(e.phase,e.row,e.code)
                entry=dict(id=mid,boundary=b.id,control=controls[ci],schema_path=tag,instance=pointer(ip),
                           keyword=keyword,expected=list(expected),actual=list(got) if got else None,
                           value_sha256=hashlib.sha256(json.dumps(candidate,sort_keys=True).encode()).hexdigest(),
                           target_clause_refused=targeted)
                if not targeted:
                    entry['reason']='not an exact targeted clause refusal; no mutation credit'
                    result['invalid_mutations'].append(entry);continue
                if got!=expected:raise AssertionError(('wrong first schema refusal',entry))
                # Reuse the actual named row seam; restore it before returning.
                old=m.CUT_ROWS
                try:
                    m.CUT_ROWS=frozenset(set(old)|{expected[:2]})
                    cut=m.schema_admission(candidate,b.validator)
                finally:m.CUT_ROWS=old
                restored=not m.schema_admission(candidate,b.validator)
                entry.update(kill=True,whole_definition_cut_accepts=cut,restoration_refuses=restored)
                if not cut or not restored:raise AssertionError(('cut/restoration failed',entry))
                result['mutations'].append(entry)
                for error_tag,error_ip in paths:
                    site=inv.get(error_tag)
                    if site is not None and any(c['id']==controls[ci] and c['instance']==pointer(error_ip) and c['positive'] for c in site['controls']):
                        if mid not in site['negatives']:site['negatives'].append(mid)
        # Structural routing and redundant assertions are recorded explicitly.
        for site in inv.values():
            key=site['keyword']
            if key in ANNOTATIONS:site['classification']='annotation'
            elif key=='additionalProperties' and site['value'] is True:
                site['classification']='permissive'
                site['cover']='additionalProperties:true imposes no refusal; the complete definition deliberately preserves this open map.'
            elif key in APPLICATORS or key=='additionalProperties' and isinstance(site['value'],dict):
                site['classification']='whole_definition_applicator'
                site['cover']='The unchanged complete validator enforces this applicator; controls and exact clause witnesses below its reachable branches are recorded. RF01 separately resolves the whole graph, dormant definitions included.'
            elif key=='format' and site['value']=='uri' and '/retained/' in b.id and '/retained/strict-v4/' not in b.id:
                site['classification']='recorded_format_skip'
                site['cover']='The authenticated raw-v1/normalized-v2/strict-v3 recipe recorded a skipped URI check. pm_dch_formats.retained_validator preserves that skip; CV-1101 date-time remains mandatory. No URI refusal or mutation credit is invented.'
            elif site['negatives']:site['classification']='witnessed'
            elif not site['controls']:
                path=site['path']
                if '/$defs/event_record_1_0_0_compatibility_reader/' in path:
                    assert not any('event_record_1_0_0_compatibility_reader' in str(x['value']) for x in inv.values() if x['keyword']=='$ref')
                    site['classification']='unreachable'
                    site['cover']='The consumed EventRecord root is version 2.0.0. No $ref in this complete resource names $defs/event_record_1_0_0_compatibility_reader. RF01 still resolves its dormant references. It is not a DCH consumed validation root.'
                elif '/scope/' in path and (('/$defs/project/' in path or b.id.endswith('/source/project')) and ('/then/' in path or '/anyOf/1/' in path and any('/'+k+'/' in path for k in ('project_id','project_home_server_id')))):
                    site['classification']='unreachable'
                    site['cover']='This edition pins scope_kind=project in scope/allOf/1. The scope/allOf/0 if(application) arm is false; its else requires nonempty Project and home-Server strings. The null alternatives and application then arm cannot participate in an accepted complete input.'
                elif '/scope/' in path and (('/$defs/application/' in path or b.id.endswith('/source/application')) and ('/else/' in path or '/anyOf/0/' in path and any('/'+k+'/' in path for k in ('project_id','project_home_server_id','named_plan_id')))):
                    site['classification']='unreachable'
                    site['cover']='This edition pins scope_kind=application in scope/allOf/1. The scope/allOf/0 then arm requires Project, home Server and named plan to be null and partition app. Its else and these string alternatives cannot participate in an accepted complete input.'
                else:site['classification']='unvisited'
            elif all(not c['positive'] for c in site['controls']):
                site['classification']='selector'
                site['cover']='Assertion is inside if/not: it selects or negates an arm; it is not an independent rejecting predicate. Both arm controls and the containing complete definition enforce the owner rule.'
            else:site['classification']='needs_cover'
        result['boundaries'].append(dict(id=b.id,family=b.family,source=b.source,
            schema_sha256=hashlib.sha256(json.dumps(b.schema,sort_keys=True).encode()).hexdigest(),
            controls=controls,inventory=list(inv.values())))
    result['summary']=dict(boundaries=len(result['boundaries']),controls=sum(len(x['controls']) for x in result['boundaries']),
        expected_refusal_kills=len(result['mutations']),invalid_mutations=len(result['invalid_mutations']))
    return result
