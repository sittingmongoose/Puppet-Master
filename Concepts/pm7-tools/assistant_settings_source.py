"""T49: Assistant Settings source transform. Never edit TestPMConcept by hand.

The normal PM7 build invokes apply after T48. A verified-checkpoint build is
also available while the pre-existing T45 tour source/guard mismatch blocks
replaying the complete upstream pipeline. It consumes the immutable shipped
checkpoint, applies this same transform and runs source checks; no gate is
skipped and no upstream success is claimed.
"""
from pathlib import Path
import hashlib,json,re,subprocess,tempfile
HERE=Path(__file__).resolve().parent
MARKER='PM7_T49_ASSISTANT_SETTINGS_V2'

def _read(name):return (HERE/name).read_text(encoding='utf-8')
def _sha(s):return hashlib.sha256(s.encode('utf-8')).hexdigest()
def apply(doc,notes,need):
    need(MARKER not in doc,'T49 is already applied')
    need('T48' in doc,'T49 requires the T48 shipped source boundary')
    contract=json.loads(_read('assistant_settings_contract.json'))
    contract['roster_ids']=['branching.crew.crew-members','branching.crew.crew-auto-roster','branching.crew.chat-room-roster','branching.crew.brainstorm-roster','planning.verification.review-roster']
    script_pat=r'(<script\b[^>]*\bid="pm4-settings-js"[^>]*>)(.*?)(</script>)'
    matches=list(re.finditer(script_pat,doc,re.S));need(len(matches)==1,'T49 needs one Settings engine')
    m=matches[0];js=m[2];before=js
    ref_match=re.search(r'window\.PM12_REFERENCE = (.*?);\n',js);need(bool(ref_match),'T49 Settings reference anchor missing')
    ref=json.loads(ref_match[1]);old_count=ref['total']
    for category in ref['byCat'].values():
        for r in category['settings']:
            r.update(contract['projection_updates'].get(r['id'],{}))
    existing={r['id'] for c in ref['byCat'].values() for r in c['settings']}
    for r in contract['new_settings']:
        if r['id'] in existing:continue
        cat,sub,*_=r['id'].split('.');row={**r,'cat':cat,'sub':sub}
        ref['byCat'][cat]['settings'].append(row)
        for g in ref['byCat'][cat]['subgroups']:
            if g['id']==sub:g['count']+=1
    ids=[r['id'] for c in ref['byCat'].values() for r in c['settings']]
    need(len(ids)==len(set(ids)),'T49 duplicate setting ID')
    ref['total']=len(ids);ref['concept_addendum']={'id':MARKER,'source':'Concepts/pm7-tools/assistant_settings_contract.json','sha256':_sha(_read('assistant_settings_contract.json')),'canonical_admission':'pending companion Plans repair'}
    js=js[:ref_match.start(1)]+json.dumps(ref,ensure_ascii=False,separators=(',',':'))+js[ref_match.end(1):]
    need(js.count('  const D = window.PM12_DATA;')==1,'T49 data init anchor drift')
    js=js.replace('  const D = window.PM12_DATA;','  const D = window.PM12_DATA;\n  installAssistantSettingsProjection();',1)
    need(js.count('  boot();\n})();')==1,'T49 engine boot anchor drift')
    js=js.replace("  function settingValue(setting) {","  function settingValue(setting) {\n    if(setting.id==='general.interaction.working-activity-style'){const value=state.settings[setting.id]??state.settings['working-activity-style']??setting.value;return value==='Step Rail'?'Step Rail Simple':value;}",1)
    js=js.replace('  boot();\n})();',_read('assistant_settings_source.js')+'\n  boot();\n})();',1)
    js='\n/* '+MARKER+' */\nwindow.PM49_ASSISTANT_SETTINGS='+json.dumps(contract,separators=(',',':'),ensure_ascii=False)+';\n'+js
    doc=doc[:m.start()]+m[1]+js+m[3]+doc[m.end():]
    # Keep the inert compatibility view in agreement with the live projection.
    data_pat=r'(<script\b[^>]*\bid="pm7-settings-data"[^>]*>)(.*?)(</script>)'
    dm=re.search(data_pat,doc,re.S);need(bool(dm),'T49 inert inventory missing')
    inv=json.loads(dm[2]);existing={r['id'] for r in inv['settings']}
    for r in inv['settings']:r.update(contract['projection_updates'].get(r['id'],{}))
    inv['settings'].extend(r for r in contract['new_settings'] if r['id'] not in existing)
    inv['concept_addendum']=ref['concept_addendum'];need(len(inv['settings'])==ref['total'],'T49 inventories disagree')
    doc=doc[:dm.start()]+dm[1]+json.dumps(inv,ensure_ascii=False,separators=(',',':'))+dm[3]+doc[dm.end():]
    css=_read('assistant_settings_source.css')
    for bad in ['backdrop-filter','color-mix(',':has(','url(#']:
        need(bad not in css,'T49 unsupported paint primitive '+bad)
    need(doc.count('</head>')==1,'T49 head anchor drift')
    doc=doc.replace('</head>','<style id="pm49-assistant-settings-css">\n'+css+'\n</style>\n</head>',1)
    need('localStorage' not in _read('assistant_settings_source.js'),'T49 must use existing project Settings persistence')
    notes.update({'source':'assistant_settings_source.py','input_settings_count':old_count,'output_settings_count':ref['total'],'new_setting_ids':[r['id'] for r in contract['new_settings']], 'existing_settings_engine_before_sha256':_sha(before),'existing_settings_engine_after_sha256':_sha(js),'canonical_plans_modified':False,'native_runtime_certified':False,'scope':'Settings engine, reference/inert inventory, scoped CSS only'})
    return doc
