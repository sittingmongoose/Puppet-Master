"""Conservative candidate-authored JSON serialization gate; never writes repairs."""
import hashlib,json,re,time
MAX_BYTES=262144
MAX_TOKENS=4096
MAX_DEPTH=128
MAX_ENUM_SECONDS=10
NUMBER=re.compile(r'-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?')
class Unassessed(ValueError):pass

def lex(raw):
    if len(raw)>MAX_BYTES:raise Unassessed('bounded_catalog_size')
    try:text=raw.decode('utf-8','strict')
    except UnicodeError:raise Unassessed('unlexable_utf8')
    out=[];i=0
    while i<len(text):
        c=text[i]
        if c in ' \r\n\t':i+=1;continue
        start=i
        if c in '{}[],:':i+=1;kind=c
        elif c=='"':
            i+=1
            while i<len(text):
                if text[i]=='"':i+=1;break
                if ord(text[i])<32:raise Unassessed('unlexable_string')
                if text[i]=='\\':
                    i+=1
                    if i>=len(text):raise Unassessed('unlexable_escape')
                    if text[i]=='u':
                        digits=text[i+1:i+5]
                        if len(digits)!=4 or any(x not in '0123456789abcdefABCDEF' for x in digits):raise Unassessed('unlexable_escape')
                        i+=5;continue
                    if text[i] not in '"\\/bfnrt':raise Unassessed('unlexable_escape')
                i+=1
            else:raise Unassessed('unclosed_string')
            kind='string'
            try:json.loads(text[start:i])
            except ValueError:raise Unassessed('unlexable_string')
        elif c=='-' or c.isascii() and c.isdigit():
            match=NUMBER.match(text,i)
            if not match:raise Unassessed('unlexable_number')
            i=match.end();kind='number'
            if i<len(text) and text[i] not in ' \r\n\t{}[],:':raise Unassessed('ambiguous_scalar_boundary')
        else:
            kind=next((word for word in ['true','false','null'] if text.startswith(word,i)),None)
            if kind is None:raise Unassessed('unlexable_nonstructural_token')
            i+=len(kind)
            if i<len(text) and text[i] not in ' \r\n\t{}[],:':raise Unassessed('ambiguous_scalar_boundary')
        out.append((kind,text[start:i].encode('utf-8')))
        if len(out)>MAX_TOKENS:raise Unassessed('bounded_token_count')
    return out

def grammatical(tokens):
    i=0;n=len(tokens)
    def kind():return tokens[i][0] if i<n else None
    def take(expected):
        nonlocal i
        if kind()!=expected:raise ValueError()
        i+=1
    def value(depth):
        nonlocal i
        if depth>MAX_DEPTH:raise ValueError()
        k=kind()
        if k in {'string','number','true','false','null'}:i+=1;return
        if k=='{':
            take('{')
            if kind()=='}':take('}');return
            while True:
                take('string');take(':');value(depth+1)
                if kind()=='}':take('}');return
                take(',')
        if k=='[':
            take('[')
            if kind()==']':take(']');return
            while True:
                value(depth+1)
                if kind()==']':take(']');return
                take(',')
        raise ValueError()
    try:value(0);return i==n
    except (ValueError,RecursionError):return False

def strict_json(raw):
    def pairs(values):
        seen=set()
        for key,value in values:
            if key in seen:raise ValueError('duplicate_key')
            seen.add(key)
        return dict(values)
    json.loads(raw.decode('utf-8'),object_pairs_hook=pairs,parse_constant=lambda value:(_ for _ in ()).throw(ValueError('nonfinite')))
    if not grammatical(lex(raw)):raise ValueError('depth_or_grammar')

def assess_sources(original,candidate):
    """Same rule for both arms. Unknown preservation rejects; no output correction."""
    base={'schema':'er9.native-catalog-syntax-preservation.v1','original_sha256':hashlib.sha256(original).hexdigest(),
      'candidate_sha256':hashlib.sha256(candidate).hexdigest(),'source_semantics_restored':'UNASSESSED','scientific_quality_assessed':False}
    try:
        old=lex(original);new=lex(candidate)
        original_valid=True
        try:strict_json(original)
        except ValueError:original_valid=False
        strict_json(candidate)
        if original_valid:
            if candidate!=original:raise Unassessed('already_valid_catalog_requires_exact_bytes')
            return {**base,'status':'PASS_EXACT_VALID_ORIGINAL','syntax_preservation_proved':True,'edit_count':0}
        # Preserve every quoted string/escape, numeric/literal lexeme, order,
        # and bracket topology. Only comma/colon syntax may change.
        if [x for x in old if x[0] not in {',',':'}]!=[x for x in new if x[0] not in {',',':'}]:raise Unassessed('nonstructural_or_bracket_tokens_changed')
        began=time.monotonic();valid=[]
        for index in range(len(old)+1):
            if time.monotonic()-began>MAX_ENUM_SECONDS:raise Unassessed('exhaustive_unique_edit_not_finished')
            for punct in [',',':']:
                proposal=old[:index]+[(punct,punct.encode())]+old[index:]
                if grammatical(proposal):valid.append(('insert',index,punct,proposal))
            if index<len(old) and old[index][0] in {',',':'}:
                proposal=old[:index]+old[index+1:]
                if grammatical(proposal):valid.append(('delete',index,old[index][0],proposal))
            if len(valid)>1:raise Unassessed('ambiguous_structural_repair')
        if len(valid)!=1 or valid[0][3]!=new:raise Unassessed('not_unique_single_comma_or_colon_edit')
        return {**base,'status':'PASS_UNIQUE_SINGLE_SYNTAX_EDIT','syntax_preservation_proved':True,'edit_count':1,
          'edit_kind':valid[0][0],'token_boundary_index':valid[0][1],'punctuation':valid[0][2],'nonstructural_lexemes_and_brackets_exact':True}
    except (ValueError,UnicodeError,RecursionError) as error:
        return {**base,'status':'UNASSESSED_REJECT','syntax_preservation_proved':False,'reason_code':str(error) if isinstance(error,Unassessed) else 'invalid_or_unsupported_json'}

def assess_research4(original,candidate):
    names={'proposal.md','sources.json','leads.json','witnesses.json'}
    if set(original)!=names or set(candidate)!=names:raise ValueError('Exact required research4 set')
    for name in names-{'sources.json'}:
        if candidate[name]!=original[name]:return {'status':'UNASSESSED_REJECT','reason_code':'noncatalog_required_bytes_changed','artifact_role':name,'source_semantics_restored':'UNASSESSED'}
    try:
        for name in ['leads.json','witnesses.json']:strict_json(candidate[name])
    except (ValueError,UnicodeError,RecursionError):
        return {'status':'UNASSESSED_REJECT','reason_code':'other_required_catalog_invalid_or_unsupported','source_semantics_restored':'UNASSESSED'}
    result=assess_sources(original['sources.json'],candidate['sources.json'])
    result['three_other_required_role_bytes_exact']=True
    return result
