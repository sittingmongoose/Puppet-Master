#!/usr/bin/env python3
"""Offline identity-bound byte-range proposal. No network, archive, candidate reads or cleanup."""
import argparse, datetime, hashlib, html, json, re, sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[1]
INPUT = ROOT / 'helpers/retention-plan-v1'
CLASSES = {'LIVE_MUTABLE_DOC_API_HISTORY', 'VERSIONED_RELEASE_OR_TAG'}
SHA = lambda b: hashlib.sha256(b).hexdigest()

def canonical(x): return json.dumps(x,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def pointer(x,p):
    for k in p.split('/')[1:]:
        k=k.replace('~1','/').replace('~0','~')
        x=x[int(k)] if isinstance(x,list) else x[k]
    return x

def offset_map(s):
    a=[0]
    for c in s:a.append(a[-1]+len(c.encode('utf-8')))
    return a

class JsonSpans:
    def __init__(self,b):
        self.b=b;self.s=b.decode('utf-8');self.off=offset_map(self.s);self.spans={};self.decoder=json.JSONDecoder()
        self.parse(0,'')
    def ws(self,i):
        while i<len(self.s) and self.s[i].isspace():i+=1
        return i
    def parse(self,i,p):
        i=self.ws(i);a=i;c=self.s[i]
        if c=='{':
            i=self.ws(i+1)
            while self.s[i]!='}':
                key,n=self.decoder.raw_decode(self.s,i);i=self.ws(n);assert self.s[i]==':'
                i=self.parse(i+1,p+'/'+key.replace('~','~0').replace('/','~1'));i=self.ws(i)
                if self.s[i]==',':i=self.ws(i+1)
                else:break
            assert self.s[i]=='}';i+=1
        elif c=='[':
            i=self.ws(i+1);n=0
            while self.s[i]!=']':
                i=self.parse(i,p+'/'+str(n));n+=1;i=self.ws(i)
                if self.s[i]==',':i=self.ws(i+1)
                else:break
            assert self.s[i]==']';i+=1
        else:_,i=self.decoder.raw_decode(self.s,i)
        self.spans[p]=(self.off[a],self.off[i]);return i
    def string_map(self,p):
        a,z=self.spans[p];token=self.b[a:z].decode('utf-8');off=offset_map(token);out=[];mp=[];i=1
        while i<len(token)-1:
            st=i
            if token[i]=='\\':
                en=i+6 if token[i+1]=='u' else i+2
                if token[i+1]=='u' and 0xD800<=int(token[i+2:i+6],16)<=0xDBFF and token[en:en+2]=='\\u':en+=6
                dec=json.loads('"'+token[i:en]+'"');i=en
            else:dec=token[i];i+=1
            for c in dec:out.append(c);mp.append((a+off[st],a+off[i]))
        assert ''.join(out)==json.loads(self.b[a:z])
        return ''.join(out),mp

class HtmlMap(HTMLParser):
    def __init__(self,b):
        super().__init__(convert_charrefs=False);self.s=b.decode('utf-8');self.off=offset_map(self.s);self.starts=[0];self.text=[];self.map=[];self.skip=0
        for m in re.finditer('\n',self.s):self.starts.append(m.end())
        self.feed(self.s);self.close()
    def pos(self):
        line,col=self.getpos();return self.starts[line-1]+col
    def gap(self):
        if self.text and self.text[-1]!=' ':self.text.append(' ');self.map.append(None)
    def handle_starttag(self,t,attrs):
        if t in ('script','style','noscript'):self.skip+=1
        if t in ('p','div','li','br','h1','h2','h3','h4','pre','tr','td','section'):self.gap()
    def handle_endtag(self,t):
        if t in ('script','style','noscript'):self.skip=max(0,self.skip-1)
        if t in ('p','div','li','br','h1','h2','h3','h4','pre','tr','td','section'):self.gap()
    def emit(self,txt,a,z):
        if self.skip:return
        for c in txt:
            if c.isspace():
                if self.text and self.text[-1]==' ':continue
                c=' '
            self.text.append(c);self.map.append((self.off[a],self.off[z]))
    def handle_data(self,d):
        if self.skip:return
        a=self.pos()
        for i,c in enumerate(d):self.emit(c,a+i,a+i+1)
    def handle_entityref(self,n):
        a=self.pos();self.emit(html.unescape('&'+n+';'),a,a+len(n)+2)
    def handle_charref(self,n):
        a=self.pos();self.emit(html.unescape('&#'+n+';'),a,a+len(n)+3)
    def view(self):return ''.join(self.text),self.map

def ranges_for(b,rule):
    kind=rule['kind'];reason=rule['reason'];ranges=[]
    if kind=='lines':
        lines=b.splitlines(keepends=True);off=[0]
        for l in lines:off.append(off[-1]+len(l))
        for a,z in rule['ranges']:
            if not(1<=a<=z<=len(lines)):raise ValueError('line range out of bounds')
            ranges.append((off[a-1],off[z],{'kind':'literal_lines','line_start_1based':a,'line_end_inclusive':z}))
    elif kind=='json_values':
        js=JsonSpans(b)
        for p in rule['pointers']:
            a,z=js.spans[p];ranges.append((a,z,{'kind':'JSON_value_token','pointer':p,'replay_transform':'JSON-decode the original value token; no reserialization'}))
    elif kind in ('text','html','json_text'):
        if kind=='html':view,mp=HtmlMap(b).view();transform='UTF-8 HTML data/entity extraction; collapse whitespace; skip script/style/noscript; map back to original literal bytes'
        elif kind=='json_text':view,mp=JsonSpans(b).string_map(rule.get('pointer','/body'));transform='JSON string decode with escape-to-original-byte mapping; no reserialization'
        else:
            view=b.decode('utf-8');off=offset_map(view);mp=[(off[i],off[i+1]) for i in range(len(view))];transform='UTF-8 literal text; no transformation'
        for pat in rule['patterns']:
            matches=list(re.finditer(pat,view,re.S))
            if len(matches)!=1:raise ValueError('pattern must match once; matched '+str(len(matches))+': '+pat)
            m=matches[0];mapped=[x for x in mp[m.start():m.end()] if x]
            if not mapped:raise ValueError('no original bytes')
            meta={'kind':kind,'private_matcher_sha256':SHA(pat.encode()),'matched_view_sha256':SHA(view[m.start():m.end()].encode()),'replay_transform':transform,**({'pointer':rule.get('pointer','/body')} if kind=='json_text' else {})}
            if kind=='html':
                # Omit intervening markup, SVG/style/class attributes and navigation.
                groups=[]
                for aa,zz in mapped:
                    if groups and (aa<=groups[-1][1] or not b[groups[-1][1]:aa].strip()):groups[-1]=(groups[-1][0],max(zz,groups[-1][1]))
                    else:groups.append((aa,zz))
                for part,(aa,zz) in enumerate(groups):ranges.append((aa,zz,{**meta,'HTML_data_fragment_index':part,'HTML_data_fragment_count':len(groups)}))
            else:
                a=min(x[0] for x in mapped);z=max(x[1] for x in mapped);ranges.append((a,z,meta))
    else:raise ValueError('unsupported range kind')
    return [(a,z,{**meta,'essential_component':reason}) for a,z,meta in ranges]

def merge_ranges(b,rs):
    # Keep provenance of every selector; merge touching ranges only.
    result=[]
    for a,z,m in sorted(rs,key=lambda x:(x[0],x[1])):
        if result and a<=result[-1]['end_exclusive']:
            result[-1]['end_exclusive']=max(z,result[-1]['end_exclusive']);result[-1]['selectors'].append(m)
        else:result.append({'start':a,'end_exclusive':z,'selectors':[m]})
    for n in result:
        frag=b[n['start']:n['end_exclusive']];n.update({'bytes':len(frag),'content_sha256':SHA(frag),'byte_offset_basis':'zero-based UTF-8 original file; half-open','transform_for_retention':'identity; slice literal original bytes'})
    return result

def explicit_bindings(node, assertion_pointer, record_path, object_):
    """Same exact record directory + path/hash only; never URL or global filename joins."""
    result=[];base=Path(record_path).parent;allowed=set(object_['paths'])
    def walk(n,q):
        if isinstance(n,dict):
            for k,v in n.items():
                if isinstance(v,str) and k in ('path','raw_bytes_path','source_path','local_path','capture_path'):
                    possible=[str(Path(v))] if Path(v).is_absolute() else [str(base/v),str(base/'sources'/v)]
                    hashes=[x for kk,x in n.items() if isinstance(x,str) and ('sha256' in kk or kk=='sha')]
                    for resolved in possible:
                        if resolved in allowed and object_['sha256'] in hashes:
                            result.append({'assertion_evidence_pointer':q,'source_path_field':k,'original_spelling':v,'resolved_frozen_source_path':resolved,'source_sha256':object_['sha256'],'binding':'exact path in original object aliases AND exact SHA in this frozen evidence record'})
                walk(v,q+'/'+k.replace('~','~0').replace('/','~1'))
        elif isinstance(n,list):
            for i,v in enumerate(n):
                if isinstance(v,str) and q.endswith('/source_files'):
                    for resolved in (str(base/v),str(base/'sources'/v)):
                        if resolved in allowed:result.append({'assertion_evidence_pointer':q+'/'+str(i),'original_spelling':v,'resolved_frozen_source_path':resolved,'source_sha256':object_['sha256'],'binding':'explicit source filename resolved ONLY in the exact frozen review directory; object identity from frozen table'})
                walk(v,q+'/'+str(i))
    walk(node,assertion_pointer)
    return result

class Inputs:
    def __init__(self):
        self.config=json.loads((OWN/'config.json').read_bytes());assert str(OWN)==self.config['own_scope'];self.initial=json.loads((OWN/'INITIAL_INPUT_IDENTITIES.json').read_bytes());self.reads={}
        for x in self.initial['files']:
            b=Path(x['path']).read_bytes();assert len(b)==x['size_bytes'] and SHA(b)==x['sha256'],x['path'];self.log(x['path'],b,'frozen helper input')
        self.plan_sha256=next(x['sha256'] for x in self.initial['files'] if x['path']==str(INPUT/'retention-plan.json'));self.plan=json.loads((INPUT/'retention-plan.json').read_bytes());self.snap=json.loads((INPUT/'snapshot.json').read_bytes());self.docs={}
    def log(self,p,b,purpose,pointer_=None):
        x=self.reads.setdefault(str(p),{'path':str(p),'size_bytes':len(b),'read_sha256':SHA(b),'purposes':[],'accessed_json_pointers':[]})
        assert x['read_sha256']==SHA(b)
        if purpose not in x['purposes']:x['purposes'].append(purpose)
        if pointer_ is not None and pointer_ not in x['accessed_json_pointers']:x['accessed_json_pointers'].append(pointer_)
    def record(self,ref):
        rec=self.plan['records'][ref['record_id']];p=rec['record']
        assert '/reviews/' in p and not any(t in p for t in ['M16','I-ANCHOR-GLM']),p
        if p not in self.docs:
            b=Path(p).read_bytes();assert SHA(b)==rec['record_sha256'],p;self.docs[p]=(b,json.loads(b))
        b,d=self.docs[p];self.log(p,b,'exact frozen assertion/review metadata',ref['pointer']);n=pointer(d,ref['pointer'])
        return {**rec,'pointer':ref['pointer'],'pointer_value_sha256':SHA(canonical(n)),'pointer_value_sha256_transform':'canonical JSON UTF-8 sort_keys=true separators=comma/colon ensure_ascii=false','role':ref['role'],'binding':ref['binding']},n
    def public(self,path,sha):
        matches=[]
        for m in self.snap['publication_manifests']:
            for i,e in enumerate(m['document']['entries']):
                original=e.get('original_path') or e.get('source_original_path') or e.get('source_runtime_relative_path')
                os=e.get('original_sha256') or e.get('source_original_sha256') or e.get('sha256')
                target=e.get('target_path') or e.get('target_repo_relative_path')
                if not target and e.get('public_path'):target='reports/'+Path(m['identity']['path']).parent.name+'/'+e['public_path']
                ts=e.get('target_sha256') or e.get('sha256')
                if original==path and os==sha:
                    matches.append({'manifest_path':m['identity']['path'],'manifest_sha256':m['identity']['sha256'],'pointer':'/entries/'+str(i),'original_path':original,'original_sha256':os,'published_path':target,'published_sha256':ts,'unchanged_original_bytes':os==ts,'reference_commit':e.get('reference_commit'),'batch':m.get('batch'),'disposition':e.get('disposition'),'remote_verified_by_selector':False,'resolution_basis':'exact original absolute path AND SHA; collision-aware; frozen manifest only'})
        return matches

def build():
    inp=Inputs();p=inp.plan;ds=json.loads((OWN/'DECISIONS.json').read_bytes());selected=[];coverage=[];source_cache={}
    eligible=[(i,o) for i,o in enumerate(p['objects']) if o.get('frozen_assertion_reference_count',0)>0 and o['locator_class'] in CLASSES]
    assert len(eligible)==len(ds['objects'])
    source_total=0
    for idx,(pi,o) in enumerate(eligible):
        decision=ds['objects'][idx];assert decision['sha256']==o['sha256'] and decision['name']==Path(o['paths'][0]).name
        path=o['paths'][0];assert str(ROOT)+'/' in path and not any(x in path for x in ['M16','I-ANCHOR-GLM']);b=Path(path).read_bytes();assert SHA(b)==o['sha256'] and len(b)==o['bytes'],path;source_total+=len(b);source_cache[idx]=b;inp.log(path,b,'eligible source identity and range resolution')
        refs=[];seen=set();nodes=[]
        for rh in o['record_references']:
            r=p['record_references'][rh]
            if r['role']!='frozen_review_assertion_reference':continue
            k=(r['record_id'],r['pointer'])
            if k in seen:continue
            seen.add(k);rr,n=inp.record(r);rr['explicit_original_source_bindings']=explicit_bindings(n,r['pointer'],rr['record'],o);rr['published_authored_matches']=inp.public(rr['record'],rr['record_sha256']);rr['original_assessment']=n.get('assessment',n.get('assessed'));rr['original_result']=n.get('result',n.get('status',n.get('disposition')));rr['original_material']=n.get('material',n.get('material_error',n.get('materiality')));refs.append(rr);nodes.append(n)
        loc=[{'table_key':x,**p['locators'][x],'record':p['records'][p['locators'][x]['record_id']]} for x in o['locators']]
        raw_public=inp.public(path,o['sha256']);assert not o['compact_authored_manifest_references'] or raw_public
        c={'eligible_index':idx,'plan_object_pointer':'/objects/'+str(pi),'source':{'path':path,'all_frozen_duplicate_paths':o['paths'],'sha256':o['sha256'],'read_sha256':SHA(b),'size_bytes':len(b),'current_read_verified_path':path,'other_aliases_current_read_verified':False},'locator_class':o['locator_class'],'frozen_assertions':refs,'locators':loc,'decision':decision['decision'],'reason':decision['reason'],'alternative':decision.get('alternative'),'original_assertion_count':len(refs),'focus_assertion_pointers':decision.get('focus_assertion_pointers'),'root_verification_pending':True,'eligible_for_deletion':False,'ranges_resolved':False,'proposed_retained_bytes':0,'hold_reasons':[]}
        if raw_public and all(x['unchanged_original_bytes'] for x in raw_public):
            c.update(decision='EXCLUDED_EXACT_COMPACT_AUTHORED_MATCH',alternative=raw_public)
        elif decision['decision']=='SELECT_PRIVATE_PROPOSED':
            try:
                rs=[]
                for rule in decision['rules']:rs+=ranges_for(b,rule)
                merged=merge_ranges(b,rs);assert merged and sum(x['bytes'] for x in merged)<len(b),'full body selection forbidden without explicit necessity'
                sid='EW'+str(idx).zfill(3);c.update(selection_id=sid,ranges_resolved=True,proposed_retained_bytes=sum(x['bytes'] for x in merged))
                selected.append({'selection_id':sid,'eligible_index':idx,'plan_object_pointer':c['plan_object_pointer'],'source':c['source'],'frozen_plan_binding':{'path':str(INPUT/'retention-plan.json'),'sha256':inp.plan_sha256,'pointer':c['plan_object_pointer']},'locator_class':c['locator_class'],'frozen_assertions':refs,'selected_assertion_pointers':decision.get('focus_assertion_pointers') or [r['pointer'] for r in refs],'unselected_assertion_components_remain_root_HOLD':bool(decision.get('focus_assertion_pointers')),'locators':loc,'essential_reason':decision['reason'],'irreplaceability_vs_immutable_and_public_alternatives':decision['irreplaceability'],'considered_alternatives':decision.get('alternative'),'ranges':merged,'proposed_retained_bytes':c['proposed_retained_bytes'],'full_document_necessary':False,'proposed_retention_policy':'Root adjudication only: retain selected necessary fragments privately for audit of the named frozen conclusion/failure; deduplicate fragment SHA identities; at most one compressed archive, no full-source default. Reject or reduce if verified immutable/public substitutes suffice. No deletion authorization.','range_scope_limits':decision.get('limits','Only resolves the cited existing source condition; no new scientific judgment or runtime evidence.'),'publication_and_license_restrictions':{'private_proposal_only':True,'raw_quotes_republished':False,'license':decision.get('license','Not established by this offline selection; do not infer a code license covers issue/wiki text.'),'public_release_authorized':False,'public_quote_word_limit_per_non_lyrical_source':25,'root_adjudication_required':True},'replay_procedure':'Verify source size and SHA against read_sha256; slice each half-open byte range literally; verify each content_sha256. select.py validate repeats exact selectors and frozen pointer identities. No refetch necessary. Preserve record/locator metadata alongside fragments if Root approves retention.','limits':['No upstream availability, permission or current release verification.','Private byte proposals do not authorize deletion or establish complete assertion sufficiency.','The original source is required to materialize proposed slices; a hash cannot reconstruct missing bytes.']})
            except (ValueError,KeyError,AssertionError) as e:
                c.update(decision='HOLD_RANGE_UNRESOLVED');c['hold_reasons']=[str(e)];c['proposed_retained_bytes']=0
        elif decision['decision'].startswith('HOLD'):c['hold_reasons']=[decision['reason']]
        coverage.append(c)
    assert source_total<=9*1024*1024
    out={'schema':'er10.essential-source-witness-selection.v1','ordinary_task_no_goal':True,'plan_only':True,'scope':'Exact frozen BATCH004-BATCH006 retention-plan objects only; not final all-campaign inventory','frozen_snapshot_closed_at':p['snapshot_closed_at'],'input_identities':inp.initial['files'],'config':inp.config,'scientific_reassessment_performed':False,'original_grades_and_truth_unchanged':True,'archive_created':False,'cleanup_performed':False,'maximum_future_private_archives':1,'literal_payloads_stored':False,'materialization_owner':'Root after adjudication; this JSON contains exact slicing metadata only','selections':selected,'coverage_summary':{'original_eligible_objects':len(eligible),'original_eligible_unique_bytes_read':source_total,'predicate_classes':dict(Counter(o['locator_class'] for _,o in eligible)),'actual_selection_objects':len(selected),'proposed_retained_literal_bytes':sum(s['proposed_retained_bytes'] for s in selected),'dispositions':dict(Counter(c['decision'] for c in coverage)),'unresolved_range_method_HOLD_objects':sum(c['decision'].startswith('HOLD') for c in coverage),'selected_objects_with_additional_assertion_components_HOLD':sum(bool(c.get('focus_assertion_pointers')) for c in coverage),'full_documents_selected':0,'root_adjudication_pending_objects':len(eligible),'delete_authorized_objects':0,'archive_candidate_count_if_root_accepts':int(bool(selected)),'campaign_complete':False,'retention_verified':False},'coverage_path':'ORIGINAL_OBJECT_COVERAGE.json','read_ledger_path':'READ_IDENTITIES.json','eligibility_count_discrepancy':'User approximate 62 mutable +22 conditional; exact frozen predicate yields54 mutable +22 conditional. No fabricated eight extra objects or expanded scope.','copyright_policy':'No raw excerpts in public brief. Proposed ranges PRIVATE, no public release authorization. Public paraphrase plus attributed locator; any public quotation <=25 words per non-lyrical source. No duplicate issue publication.'}
    # Verify exact visible-content mappings only, never scientific correctness.
    maps=[];sels={x['eligible_index']:x for x in selected}
    for c in coverage:
        if c['decision']!='ALTERNATIVE_SELECTED_EXTRACT':continue
        ti=c['alternative']['selected_eligible_index'];raw=source_cache[c['eligible_index']]
        if ti not in sels:
            c['decision']='HOLD_ALTERNATIVE_EXTRACT_UNRESOLVED';c['hold_reasons']=['Replacement target has no resolved selection'];continue
        view,mp=HtmlMap(raw).view();chars=[];char_map=[]
        for ch,pos in zip(view,mp):
            if not ch.isspace():chars.append(ch);char_map.append(pos)
        compact=''.join(chars);row={'raw_eligible_index':c['eligible_index'],'selected_eligible_index':ti,'selection_id':sels[ti]['selection_id'],'source':c['source'],'transform':'Selected fragment UTF-8 text, or JSON string decode; HTML UTF-8 data/entity extraction excluding script/style/noscript; remove all Unicode whitespace on BOTH sides for exact comparison. No semantic inference.','fragments':[],'all_necessary_text_components_match':True,'not_whole_document_equivalence':True}
        for z in sels[ti]['ranges']:
            frag=source_cache[ti][z['start']:z['end_exclusive']];kind=z['selectors'][0]['kind'];txt=frag.decode('utf-8')
            if kind=='json_text':txt=json.loads('"'+txt+'"')
            elif kind=='JSON_value_token':
                val=json.loads(frag);txt=str(val) if not isinstance(val,str) else val
            wanted=''.join(ch for ch in txt if not ch.isspace());starts=[m.start() for m in re.finditer(re.escape(wanted),compact)] if wanted else []
            required=kind!='JSON_value_token';item={'selected_range_sha256':z['content_sha256'],'compared_normalized_content_sha256':SHA(wanted.encode()),'exact_visible_match_count':len(starts),'necessary_text_component':required,'raw_literal_ranges':[]}
            if starts:
                mapped=[x for x in char_map[starts[0]:starts[0]+len(wanted)] if x];groups=[]
                for aa,zz in mapped:
                    if groups and (aa<=groups[-1][1] or not raw[groups[-1][1]:aa].strip()):groups[-1]=(groups[-1][0],max(zz,groups[-1][1]))
                    else:groups.append((aa,zz))
                item['matched_occurrence_0based']=0
                for aa,zz in groups:item['raw_literal_ranges'].append({'start':aa,'end_exclusive':zz,'bytes':zz-aa,'content_sha256':SHA(raw[aa:zz]),'transform_for_retention':'identity; no raw payload stored'})
            elif required:row['all_necessary_text_components_match']=False
            row['fragments'].append(item)
        maps.append(row);c['extract_mapping_status']='EXACT_REQUIRED_TEXT_MAPPING' if row['all_necessary_text_components_match'] else 'HOLD_MAPPING_COMPONENT_UNRESOLVED'
        if not row['all_necessary_text_components_match']:
            c['decision']='HOLD_MAPPING_COMPONENT_UNRESOLVED';c['hold_reasons']=['At least one proposed necessary extracted text component cannot be mapped exactly to visible original HTML; no guessed transform.']
    out['coverage_summary']['dispositions']=dict(Counter(c['decision'] for c in coverage))
    out['coverage_summary']['unresolved_range_method_HOLD_objects']=sum(c['decision'].startswith('HOLD') for c in coverage)
    out['render_mapping_path']='RENDERED_EXTRACT_MAPPINGS.json'
    fragments={}
    for sel in selected:
        for z in sel['ranges']:
            f=fragments.setdefault(z['content_sha256'],{'content_sha256':z['content_sha256'],'bytes':z['bytes'],'proposed_payload_name':z['content_sha256']+'.bin','origins':[]})
            assert f['bytes']==z['bytes']
            f['origins'].append({'selection_id':sel['selection_id'],'source_path':sel['source']['path'],'source_sha256':sel['source']['sha256'],'start':z['start'],'end_exclusive':z['end_exclusive']})
    out['coverage_summary']['deduplicated_proposed_payload_bytes']=sum(f['bytes'] for f in fragments.values())
    out['coverage_summary']['deduplicated_proposed_fragment_count']=len(fragments)
    out['proposed_fragment_index_path']='PROPOSED_FRAGMENT_INDEX.json'
    # Normalize repeated frozen tables and shared policies; keep every exact pointer/identity.
    assertion_table={};locator_table={};record_table={}
    for c in coverage:
        slim=[]
        for ref in c['frozen_assertions']:
            key=SHA(canonical([ref['record'],ref['record_sha256'],ref['pointer']]))
            base={k:v for k,v in ref.items() if k not in ('explicit_original_source_bindings','binding')}
            if key in assertion_table:assert assertion_table[key]==base
            else:assertion_table[key]=base
            slim.append({'assertion_ref_id':key,'explicit_original_source_bindings':ref['explicit_original_source_bindings'],'binding':ref['binding']})
        c['frozen_assertions']=slim
        lids=[]
        for loc in c['locators']:
            key=loc['table_key'];record_table[loc['record_id']]=loc['record']
            locator_table[key]={k:v for k,v in loc.items() if k not in ('table_key','record')};lids.append(key)
        c['locators']=lids
    byindex={c['eligible_index']:c for c in coverage}
    shared_keys=('proposed_retention_policy','publication_and_license_restrictions','replay_procedure','limits')
    policies={}
    for sel in selected:
        c=byindex[sel['eligible_index']];sel['frozen_assertions']=c['frozen_assertions'];sel['locators']=c['locators']
        policy={k:sel.pop(k) for k in shared_keys};pk=SHA(canonical(policy));policies[pk]=policy;sel['policy_ref_id']=pk
    out.update(frozen_assertion_table=assertion_table,locator_table=locator_table,locator_record_table=record_table,policy_table=policies,normalization='Row frozen_assertions[].assertion_ref_id resolves in frozen_assertion_table; row locators[] resolves in locator_table, whose record_id resolves in locator_record_table. Row policy_ref_id resolves in policy_table. Exact original path/SHA/pointer identities preserved. Coverage uses these same tables.')
    return out,{'schema':'er10.original-object-coverage.v1','tables_in':'SELECTED_MINIMAL_WITNESSES.json','coverage':coverage}, {'schema':'er10.selector-read-identities.v1','records':sorted(inp.reads.values(),key=lambda x:x['path'])}, {'schema':'er10.exact-render-mappings.v1','mappings':maps}, {'schema':'er10.proposed-fragments.v1','materialized':False,'archive_created':False,'fragments':sorted(fragments.values(),key=lambda x:x['content_sha256'])}


def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('mode',choices=['reproduce','validate']);a=ap.parse_args()
    out,cov,reads,mappings,fragments=build();artifacts={'SELECTED_MINIMAL_WITNESSES.json':out,'ORIGINAL_OBJECT_COVERAGE.json':cov,'READ_IDENTITIES.json':reads,'RENDERED_EXTRACT_MAPPINGS.json':mappings,'PROPOSED_FRAGMENT_INDEX.json':fragments}
    if a.mode=='reproduce':
        for n,x in artifacts.items():(OWN/n).write_text(json.dumps(x,indent=2,sort_keys=True,ensure_ascii=False)+'\n')
    else:
        for n,x in artifacts.items():assert json.loads((OWN/n).read_bytes())==x,'offline replay differs: '+n
        for s in out['selections']:
            assert s['source']['sha256']==s['source']['read_sha256']
            assert s['frozen_assertions'] and not s['full_document_necessary']
        assert not out['archive_created'] and not out['cleanup_performed']
    print(json.dumps({'mode':a.mode,'offline_replay_identical':a.mode=='validate',**out['coverage_summary']},indent=2))
if __name__=='__main__':main()
